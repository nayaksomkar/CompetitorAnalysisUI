import type { ChatAsset } from '../types';

export interface StreamableResult {
  text: string;
  assets: ChatAsset[];
}

export type StreamEvent =
  | { type: 'text'; delta: string }
  | { type: 'asset'; asset: ChatAsset }
  | { type: 'done' };

export type StreamResponse = AsyncGenerator<StreamEvent, void, void>;

export const STREAM_PACE = {
  wordsPerChunk: 3,
  textChunkDelayMs: 22,
  assetDelayMs: 320,
  betweenStageMs: 90,
} as const;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

type Stage =
  | { type: 'text'; text: string }
  | { type: 'asset'; asset: ChatAsset };

/** Split into paragraphs, then sentences, keeping trailing whitespace. */
export function splitTextUnits(text: string): string[] {
  const trimmed = text.replace(/\s+$/, '');
  if (!trimmed) return [];
  const paragraphs = trimmed.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  const source = paragraphs.length > 1 ? paragraphs : [trimmed];
  const units: string[] = [];
  for (const block of source) {
    const sentences = block.match(/[^.!?\n]+[.!?]+(?:\s+|$)|[^.!?\n]+$/g);
    if (sentences && sentences.length > 1) {
      for (const s of sentences) {
        const t = s.trim();
        if (t) units.push(t);
      }
    } else {
      units.push(block.trim());
    }
  }
  return units;
}

/**
 * Interleave text units with assets so generation is:
 * some text → asset → more text → next asset → …
 * rather than all text followed by every asset at the end.
 */
export function buildGenerationStages(result: StreamableResult): Stage[] {
  const units = splitTextUnits(result.text ?? '');
  const assets = result.assets ?? [];
  const stages: Stage[] = [];

  if (assets.length === 0) {
    return units.map((text) => ({ type: 'text' as const, text }));
  }

  if (units.length === 0) {
    return assets.map((asset) => ({ type: 'asset' as const, asset }));
  }

  // Spread text units across slots around each asset.
  const slots = assets.length + 1;
  const buckets: string[][] = Array.from({ length: slots }, () => []);
  units.forEach((unit, i) => {
    const slot = Math.min(Math.floor((i * slots) / units.length), slots - 1);
    buckets[slot].push(unit);
  });

  // Guarantee the first asset is not delayed until every sentence is out:
  // if slot 0 ate everything, move the tail into later slots.
  if (buckets[0].length === units.length && units.length > 1) {
    const keep = Math.max(1, Math.ceil(units.length / slots));
    const rest = buckets[0].splice(keep);
    rest.forEach((u, i) => buckets[1 + (i % (slots - 1))].push(u));
  }

  for (let i = 0; i < slots; i++) {
    const joined = buckets[i].join(' ').trim();
    if (joined) stages.push({ type: 'text', text: joined + (joined.endsWith('\n') ? '' : ' ') });
    if (i < assets.length) stages.push({ type: 'asset', asset: assets[i] });
  }

  return stages;
}

function* wordChunks(text: string, wordsPerChunk: number): Generator<string> {
  const tokens = text.match(/\S+\s*/g);
  if (!tokens) {
    if (text) yield text;
    return;
  }
  for (let i = 0; i < tokens.length; i += wordsPerChunk) {
    yield tokens.slice(i, i + wordsPerChunk).join('');
  }
}

export interface StreamFromResultOpts {
  wordsPerChunk?: number;
  textChunkDelayMs?: number;
  assetDelayMs?: number;
  betweenStageMs?: number;
}

/**
 * Convert a complete AskResult into a progressive StreamEvent sequence.
 * Used when the backend cannot stream natively, and for local predefined replies.
 */
export async function* streamFromResult(
  result: StreamableResult,
  opts?: StreamFromResultOpts,
): StreamResponse {
  const wordsPerChunk = opts?.wordsPerChunk ?? STREAM_PACE.wordsPerChunk;
  const textDelay = opts?.textChunkDelayMs ?? STREAM_PACE.textChunkDelayMs;
  const assetDelay = opts?.assetDelayMs ?? STREAM_PACE.assetDelayMs;
  const betweenStage = opts?.betweenStageMs ?? STREAM_PACE.betweenStageMs;

  const stages = buildGenerationStages(result);
  for (let i = 0; i < stages.length; i++) {
    const stage = stages[i];
    if (i > 0) await sleep(betweenStage);
    if (stage.type === 'text') {
      for (const chunk of wordChunks(stage.text, wordsPerChunk)) {
        yield { type: 'text', delta: chunk };
        await sleep(textDelay);
      }
    } else {
      await sleep(assetDelay);
      yield { type: 'asset', asset: stage.asset };
    }
  }
  yield { type: 'done' };
}

/** Consume a fetch Response as SSE or NDJSON. Caller must confirm content-type. */
async function* streamFromHttpBody(response: Response): StreamResponse {
  const ct = (response.headers.get('content-type') ?? '').toLowerCase();
  if (!response.body) {
    yield { type: 'done' };
    return;
  }
  if (ct.includes('text/event-stream')) {
    yield* parseSseStream(response.body);
    return;
  }
  yield* parseNdjsonStream(response.body);
}

async function* parseSseStream(body: ReadableStream<Uint8Array>): StreamResponse {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const frames = buffer.split('\n\n');
      buffer = frames.pop() ?? '';
      for (const frame of frames) {
        const event = parseSseFrame(frame);
        if (event) yield event;
      }
    }
    if (buffer.trim()) {
      const event = parseSseFrame(buffer);
      if (event) yield event;
    }
  } finally {
    reader.releaseLock();
  }
  yield { type: 'done' };
}

function parseSseFrame(frame: string): StreamEvent | null {
  let data = '';
  for (const line of frame.split('\n')) {
    if (line.startsWith('data:')) data += line.slice(5).trim();
  }
  if (!data || data === '[DONE]') return null;
  try {
    const parsed = JSON.parse(data) as Record<string, unknown>;
    return coerceStreamEvent(parsed);
  } catch {
    return { type: 'text', delta: data };
  }
}

async function* parseNdjsonStream(body: ReadableStream<Uint8Array>): StreamResponse {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        try {
          const event = coerceStreamEvent(JSON.parse(trimmed) as Record<string, unknown>);
          if (event) yield event;
        } catch {
          /* skip malformed line */
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
  yield { type: 'done' };
}

function coerceStreamEvent(parsed: Record<string, unknown>): StreamEvent | null {
  const type = parsed.type ?? parsed.event;
  if (type === 'text' && typeof parsed.delta === 'string') {
    return { type: 'text', delta: parsed.delta };
  }
  if (type === 'text' && typeof parsed.text === 'string') {
    return { type: 'text', delta: parsed.text };
  }
  if (type === 'asset' && parsed.asset && typeof parsed.asset === 'object') {
    return { type: 'asset', asset: parsed.asset as ChatAsset };
  }
  if (type === 'done') return { type: 'done' };
  if (typeof parsed.delta === 'string') return { type: 'text', delta: parsed.delta };
  return null;
}

/** Run a native HTTP stream if the response is actually streamed; otherwise null. */
export async function tryNativeHttpStream(response: Response): Promise<StreamResponse | null> {
  const ct = (response.headers.get('content-type') ?? '').toLowerCase();
  if (
    ct.includes('text/event-stream') ||
    ct.includes('ndjson') ||
    ct.includes('jsonl') ||
    ct.includes('x-ndjson')
  ) {
    return streamFromHttpBody(response);
  }
  return null;
}
