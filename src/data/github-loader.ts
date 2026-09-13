// =============================================================================
// GitHub Data Loader
//
// Loads sample analysis data from GitHub-hosted JSON files.
//
// Usage:
//  1. Upload perfume.json and protein.json to a GitHub repo
//  2. Set VITE_DATA_REPO to "owner/repo" (e.g. "myorg/competitor-data")
//  3. The loader fetches from raw.githubusercontent.com/{repo}/main/{file}
//
// Fallback: if no GitHub repo is configured, loads from local JSON files
// bundled with the app (src/data/*.json).
// =============================================================================

import type { AnalysisData, BusinessProfile } from '../types';

const GITHUB_RAW = 'https://raw.githubusercontent.com';

/** Default repo — override with VITE_DATA_REPO env var. */
const DEFAULT_REPO = import.meta.env.VITE_DATA_REPO as string | undefined;

/** Branch to fetch from (default: main). */
const DATA_BRANCH = import.meta.env.VITE_DATA_BRANCH ?? 'main';

/** Cache loaded data in memory to avoid refetching. */
const cache = new Map<string, AnalysisData>();

/** Cache TTL in milliseconds (5 minutes). */
const CACHE_TTL = 5 * 60 * 1000;
const cacheTime = new Map<string, number>();

// ----- Local JSON imports (bundled fallback) -----

// JSON data is typed loosely; we cast to AnalysisData after load since the
// JSON shape matches the internal type but TypeScript infers string literals.
const localJson: Record<string, () => Promise<{ default: unknown }>> = {
  perfume: () => import('./perfume.json'),
  protein: () => import('./protein.json'),
};

// ----- Sample metadata -----

export interface SampleMeta {
  id: string;
  label: string;
  profile: BusinessProfile;
}

/**
 * Sample list — used by the Questionnaire to show available samples.
 * Profiles are extracted from the JSON data.
 */
export async function getSampleList(): Promise<SampleMeta[]> {
  const ids = ['perfume', 'protein'];
  const list: SampleMeta[] = [];
  for (const id of ids) {
  const data = await loadSample(id);
  list.push({
  id,
  label: `${data.businessName} — ${data.industry}`,
  profile: data.profile,
  });
  }
  return list;
}

// ----- Core loader -----

/**
 * Load a sample by id. Tries GitHub first (if configured), then local JSON.
 * Results are cached in memory.
 */
export async function loadSample(id: string): Promise<AnalysisData> {
  const now = Date.now();
  const cached = cache.get(id);
  const cachedAt = cacheTime.get(id);
  if (cached && cachedAt && now - cachedAt < CACHE_TTL) {
  return cached;
  }

  let data: AnalysisData | null = null;

  // 1. Try GitHub if configured
  if (DEFAULT_REPO) {
  data = await fetchFromGitHub(id);
  }

  // 2. Fallback to local JSON
  if (!data) {
  data = await fetchLocal(id);
  }

  if (!data) {
  throw new Error(`Sample "${id}" not found in any data source`);
  }

  cache.set(id, data);
  cacheTime.set(id, now);
  return data;
}

/**
 * Force-refresh a sample (bypass cache).
 */
export async function refreshSample(id: string): Promise<AnalysisData> {
  cache.delete(id);
  cacheTime.delete(id);
  return loadSample(id);
}

/**
 * Clear all cached data.
 */
export function clearCache(): void {
  cache.clear();
  cacheTime.clear();
}

// ----- GitHub fetch -----

async function fetchFromGitHub(id: string): Promise<AnalysisData | null> {
  const url = `${GITHUB_RAW}/${DEFAULT_REPO}/${DATA_BRANCH}/${id}.json`;
  try {
  const res = await fetch(url, {
  headers: { Accept: 'application/json' },
  });
  if (!res.ok) {
  console.warn(`[data] GitHub fetch failed for ${id}: ${res.status}`);
  return null;
  }
  return (await res.json()) as AnalysisData;
  } catch (err) {
  console.warn(`[data] GitHub fetch error for ${id}:`, err);
  return null;
  }
}

// ----- Local fetch -----

async function fetchLocal(id: string): Promise<AnalysisData | null> {
  const loader = localJson[id];
  if (!loader) return null;
  try {
  const mod = await loader();
  return mod.default as AnalysisData;
  } catch (err) {
  console.warn(`[data] Local JSON load error for ${id}:`, err);
  return null;
  }
}

// ----- GitHub URL helpers -----

/**
 * Build the raw GitHub URL for a given sample id.
 * Useful for debugging or direct linking.
 */
export function buildGitHubUrl(id: string, repo: string = DEFAULT_REPO ?? '', branch: string = DATA_BRANCH): string {
  if (!repo) return '';
  return `${GITHUB_RAW}/${repo}/${branch}/${id}.json`;
}

/**
 * Check if GitHub data source is configured.
 */
export function isGitHubConfigured(): boolean {
  return !!DEFAULT_REPO;
}
