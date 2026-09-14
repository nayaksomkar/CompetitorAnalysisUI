// =============================================================================
// Swappable data layer.
//
// Today: returns mock data instantly based on the active sample.
// Tomorrow: replace `mockApi` with a fetch-based `httpApi` that calls your backend.
//
// RULES
//  1. Views and components should NEVER import from `data/*` directly.
//  They should call `api` so the swap is one line.
//  2. The shape returned by `api` MUST match the types in `src/types.ts`.
//  That's the contract between this layer and the UI.
// =============================================================================

import type {
  AnalysisData,
  BusinessProfile,
  ChatAsset,
} from '../types';
import { samples, type SampleId } from '../data';

export interface AskOptions {
  prompt: string;
  context?: AnalysisData;
}

export interface AskResult {
  text: string;
  assets: ChatAsset[];
}

export interface ApiClient {
  bootstrap(profile: BusinessProfile, sampleId: SampleId): Promise<AnalysisData>;
  ask(opts: AskOptions): Promise<AskResult>;
  regenerate(opts: { section: string; data: AnalysisData }): Promise<ChatAsset[]>;
}

// ----- Mock implementation -----

// Tiny helper so the UI gets to show its loading states even with mock data.
// A real HTTP client would also need to await the network — same contract.
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Naive intent classifier used by the mock to decide which asset to return.
// Replace this with a real classifier (or an LLM call) when wiring the backend.
const detectIntent = (prompt: string): { section: string } => {
  const p = prompt.toLowerCase();
  if (p.includes('swot')) return { section: 'swot' };
  if (p.includes('pric')) return { section: 'pricing' };
  if (p.includes('competitor') || p.includes('vs') || p.includes('compare')) return { section: 'competitors' };
  if (p.includes('product')) return { section: 'products' };
  if (p.includes('gap')) return { section: 'gaps' };
  if (p.includes('insight') || p.includes('recommend')) return { section: 'insights' };
  if (p.includes('report')) return { section: 'reports' };
  if (p.includes('chart') || p.includes('graph')) return { section: 'chart' };
  if (p.includes('plan') || p.includes('action')) return { section: 'plan' };
  if (p.includes('overview') || p.includes('summary')) return { section: 'overview' };
  return { section: 'overview' };
};

// Maps an intent section to a concrete chat response (text + assets).
// This is where the mock "AI" picks what to show. Keep this readable —
// it's the most-touched file when you want to tune the demo.
const buildAskResult = (prompt: string, data: AnalysisData): AskResult => {
  const { section } = detectIntent(prompt);

  switch (section) {
  case 'swot': {
  const c = data.competitors[1];
  return {
  text: `Here\'s a SWOT for **${c.name}**, your most important counter-positioning target. Opportunities + Threats are where you can act fastest.`,
  assets: [{ kind: 'swot', data: { competitorId: c.id, swot: c.swot }, explanation: c.explanation }],
  };
  }
  case 'pricing': {
  const mids = data.pricingTiers.filter((t) => t.highlighted);
  return {
  text: `Here\'s the side-by-side of the most-popular tiers across your competitors. Click the monthly/yearly toggle to flip cycles.`,
  assets: [{
  kind: 'pricing-table',
  data: {
  title: 'Mid-market pricing comparison',
  tiers: mids.length ? mids : data.pricingTiers.slice(0, 3),
  },
  explanation: {
  summary: 'Your launch price has to sit in a defensible band — neither premium-only nor mass-only.',
  whyItMatters: [
  'Pricing is the most-leveraged lever in early sales cycles.',
  'Discovery set pricing anchors long-term AOV.',
  ],
  evidence: [{ label: 'Data source', detail: 'Public pricing pages, Aug 2026.' }],
  sources: data.sources.slice(0, 3),
  },
  }],
  };
  }
  case 'competitors': {
  return {
  text: `Here\'s a quick comparison table across the four competitors that matter for your ICP. Click any column to sort.`,
  assets: [{
  kind: 'comparison-table',
  data: {
  title: 'Competitor comparison — at-a-glance',
  columns: ['Vendor', 'Share', 'Growth', 'Pricing tier', 'Position', 'Biggest weakness'],
  rows: data.competitors.map((c) => ({
  name: c.name,
  cells: [
  `${c.marketShare}%`,
  `${c.growthRate}%`,
  c.pricingTier ?? '—',
  c.marketPosition ?? '—',
  c.weaknesses?.[0] ?? '—',
  ],
  })),
  },
  explanation: {
  summary: 'Four competitors, four distinct strategies — and four different ways for you to win.',
  whyItMatters: [
  'Different competitors in different deals; tailor your narrative.',
  'Each needs a different counter-message.',
  ],
  evidence: [{ label: 'Data source', detail: 'G2 Grid + Forrester Wave 2026 (s2, s3).' }],
  sources: data.sources.slice(1, 4),
  },
  }],
  };
  }
  case 'products': {
  const p = data.products[0];
  return {
  text: `Here\'s a deep dive into **${p.name}**, the comparison anchor most buyers will benchmark you against.`,
  assets: [{ kind: 'product-breakdown', data: p }],
  };
  }
  case 'gaps': {
  const g = data.marketGaps[0];
  return {
  text: `The biggest gap right now is **${g.title}** — a clean, time-bounded opening.`,
  assets: [{ kind: 'market-gap', data: g }],
  };
  }
  case 'insights': {
  const i = data.insights[0];
  return {
  text: `Here\'s the highest-impact insight for this quarter: **${i.title}**.`,
  assets: [{ kind: 'insight', data: i }],
  };
  }
  case 'reports': {
  const r = data.reports[0];
  return {
  text: `Here\'s the executive summary report — three sections you can share with leadership.`,
  assets: [{ kind: 'report', data: r }],
  };
  }
  case 'plan': {
  return {
  text: `Here\'s a sequenced action plan — the three P0s are what I\'d ship in the next 60 days.`,
  assets: [{
  kind: 'action-plan',
  data: {
  title: `${data.profile.businessName} — 90-day action plan`,
  items: data.actionPlan,
  },
  explanation: {
  summary: 'Three moves, sequenced for compounding impact.',
  whyItMatters: [
  'Sequencing matters; the first move unlocks the others.',
  'Keep long-horizon items on a monthly review cadence.',
  ],
  evidence: [{ label: 'Source', detail: 'Internal synthesis of all evidence.' }],
  sources: data.sources.slice(0, 4),
  },
  }],
  };
  }
  case 'chart': {
  return {
  text: `Here\'s a quick visual of where each competitor sits on the share vs. growth plane.`,
  assets: [{ kind: 'chart', data: data.charts.marketShare }],
  };
  }
  default: {
  return {
  text: `Here\'s the **Overview** for ${data.profile.businessName} — top competitors, biggest gaps and the three moves that matter this quarter.`,
  assets: [
  { kind: 'insight', data: data.insights[0] },
  { kind: 'market-gap', data: data.marketGaps[0] },
  { kind: 'chart', data: data.charts.marketShare },
  ],
  };
  }
  }
};

const mockApi: ApiClient = {
  async bootstrap(profile, sampleId) {
  await sleep(250);
  const base = samples[sampleId];
  return { ...base, profile: { ...base.profile, ...profile } };
  },
  async ask({ prompt, context }) {
  await sleep(450);
  const data = context ?? samples.perfume;
  return buildAskResult(prompt, data);
  },
  async regenerate({ section, data }) {
  await sleep(350);
  return buildAskResult(section, data).assets;
  },
};

// LLM Ping microservice for AI chat responses
const LLMPING_URL = 'https://llmping.onrender.com';

class LlmPingApi implements ApiClient {
  async bootstrap(profile: BusinessProfile, sampleId: SampleId): Promise<AnalysisData> {
  // For bootstrap, use local sample data (competitor engine not yet integrated)
  await new Promise((r) => setTimeout(r, 250));
  const base = samples[sampleId];
  return { ...base, profile: { ...base.profile, ...profile } };
  }

  async ask({ prompt, context }: AskOptions): Promise<AskResult> {
  const data = context ?? samples.perfume;

  try {
  // Call LLM Ping microservice
  const response = await fetch(`${LLMPING_URL}/chat`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ query: prompt }),
  });

  if (!response.ok) {
  throw new Error(`LLM Ping failed: ${response.status}`);
  }

  const result = await response.json();
  // LLM Ping returns: { response: "..." } or { answer: "..." } or { text: "..." }
  const aiText = result.response ?? result.answer ?? result.text ?? result.result ?? '';

  return {
  text: aiText || `Here's what I found about "${prompt}" for ${data.profile.businessName}.`,
  assets: this.buildAssetsFromPrompt(prompt, data),
  };
  } catch (error) {
  // Fallback to local response if LLM Ping is unavailable
  console.warn('LLM Ping unavailable, using local fallback:', error);
  return buildAskResult(prompt, data);
  }
  }

  async regenerate({ section, data }: { section: string; data: AnalysisData }): Promise<ChatAsset[]> {
  await new Promise((r) => setTimeout(r, 350));
  return buildAskResult(section, data).assets;
  }

  // Helper to build UI assets based on prompt intent
  private buildAssetsFromPrompt(prompt: string, data: AnalysisData): ChatAsset[] {
  const p = prompt.toLowerCase();
  if (p.includes('swot')) {
  const c = data.competitors[1];
  return [{ kind: 'swot', data: { competitorId: c.id, swot: c.swot }, explanation: c.explanation }];
  }
  if (p.includes('pric')) {
  return [{ kind: 'pricing-table', data: { title: 'Pricing comparison', tiers: data.pricingTiers.slice(0, 4) } }];
  }
  if (p.includes('chart') || p.includes('graph') || p.includes('market share')) {
  return [{ kind: 'chart', data: data.charts.marketShare }];
  }
  if (p.includes('competitor') || p.includes('compare')) {
  return [{ kind: 'comparison-table', data: {
  title: 'Competitor comparison',
  columns: ['Vendor', 'Share', 'Growth', 'Position'],
  rows: data.competitors.map((c) => ({
  name: c.name,
  cells: [`${c.marketShare}%`, `${c.growthRate}%`, c.marketPosition ?? '—'],
  })),
  }}];
  }
  // Default: return overview assets
  return [
  { kind: 'insight', data: data.insights[0] },
  { kind: 'chart', data: data.charts.marketShare },
  ];
  }
}

// ----- Orchestrator API (CompetitorEngine) -----

import type { OrchestratorResponse, ContextUpdate } from '../types';
import { getActiveBaseUrl } from '../components/EndpointSettings';

// Toggle between mock, LLM Ping, and Orchestrator API
const USE_ORCHESTRATOR = true; // Set to false to use LLM Ping or mock
const USE_LLM_PING = true; // Set to false to use local mock data

class OrchestratorApi implements ApiClient {
  private getBaseUrl(): string {
    return getActiveBaseUrl();
  }

  async bootstrap(profile: BusinessProfile, sampleId: SampleId): Promise<AnalysisData> {
    await new Promise((r) => setTimeout(r, 250));
    const base = samples[sampleId];
    return { ...base, profile: { ...base.profile, ...profile } };
  }

  async ask({ prompt, context }: AskOptions): Promise<AskResult> {
    const data = context ?? samples.perfume;
    const baseUrl = this.getBaseUrl();

    // Build context_update from the current analysis
    const contextUpdate: ContextUpdate = {
      version: 1,
      business: {
        name: data.profile.businessName,
        industry: data.profile.industry,
        pricing: data.profile.pricing,
        model: data.profile.businessModel,
      },
      entities: {
        competitors: data.competitors.map((c) => c.id),
        focus: null,
      },
      result_meta: {
        requested_count: data.competitors.length,
        retrieved_count: data.competitors.length,
        filters: [],
      },
      constraints: { included: [], excluded: [] },
      keywords: [data.profile.industry],
    };

    // Classify intent from the prompt
    const intent = this.classifyIntent(prompt);

    const response = await fetch(`${baseUrl}/api/v1/parser/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        parser_input: {
          intent,
          message: prompt,
          session_id: `ui-${Date.now()}`,
          context_update: contextUpdate,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Orchestrator failed: ${response.status}`);
    }

    const result: OrchestratorResponse = await response.json();

    // Convert orchestrator response to AskResult
    const assets: ChatAsset[] = [];

    // If there's an answer block, convert it to assets
    if (result.answer) {
      if (result.answer.competitors) {
        for (const comp of result.answer.competitors) {
          assets.push({ kind: 'lookup-card', data: comp });
        }
      }
      if (result.answer.comparedTo && result.answer.comparedTo.length > 0) {
        assets.push({
          kind: 'lookup-comparison',
          data: {
            title: 'Comparison',
            competitors: result.answer.comparedTo,
          },
        });
      }
    }

    // If there's data (bootstrap/refine), use it
    if (result.data) {
      // Merge any new competitors from the response
      if (result.data.competitors.length > 0) {
        // For now, just use the existing data
      }
    }

    return {
      text: result.answer?.summary ?? result.error ?? 'No response from orchestrator',
      assets,
    };
  }

  async regenerate({ section, data }: { section: string; data: AnalysisData }): Promise<ChatAsset[]> {
    await new Promise((r) => setTimeout(r, 350));
    return buildAskResult(section, data).assets;
  }

  private classifyIntent(prompt: string): string {
    const p = prompt.toLowerCase();
    if (p.includes('compare') || p.includes('vs')) return 'compare';
    if (p.includes('add') || p.includes('refine')) return 'refine';
    if (p.includes('explain')) return 'explain';
    if (p.includes('regenerate') || p.includes('redo')) return 'regenerate';
    return 'question';
  }
}

export const api: ApiClient = USE_ORCHESTRATOR
  ? new OrchestratorApi()
  : USE_LLM_PING
    ? new LlmPingApi()
    : mockApi;