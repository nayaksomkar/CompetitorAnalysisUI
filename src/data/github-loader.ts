// =============================================================================
// GitHub Data Loader
//
// Loads sample analysis data from GitHub-hosted JSON files.
//
// Predefined examples are loaded strictly from raw.githubusercontent.com.
// =============================================================================

import type { AnalysisData, BusinessProfile } from '../types';
import { samples, type SampleId } from './local-samples';

const GITHUB_RAW = 'https://raw.githubusercontent.com';

/** Default repo — override with VITE_DATA_REPO env var. */
const DEFAULT_REPO = (import.meta.env.VITE_DATA_REPO as string | undefined)
  || 'nayaksomkar/CompetitorAnalysisUI';

/** Branch to fetch from (default: main). */
const DATA_BRANCH = import.meta.env.VITE_DATA_BRANCH ?? 'main';

/** Cache loaded data in memory to avoid refetching. */
const cache = new Map<string, AnalysisData>();

/** Cache TTL in milliseconds (5 minutes). */
const CACHE_TTL = 5 * 60 * 1000;
const cacheTime = new Map<string, number>();

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
 * Load a sample by id from GitHub. Results are cached in memory.
 */
export async function loadSample(id: string): Promise<AnalysisData> {
  const local = getLocalSample(id);
  const now = Date.now();
  const cached = cache.get(id);
  const cachedAt = cacheTime.get(id);
  if (cached && cachedAt && now - cachedAt < CACHE_TTL) {
    return cached;
  }

  try {
    const data = await loadGitHubSample(id);
    cache.set(id, data);
    cacheTime.set(id, now);
    return data;
  } catch (error) {
    if (!local) throw error;
    console.warn(`[data] GitHub sample unavailable for ${id}; using the complete local dataset.`, error);
    return local;
  }
}

/**
 * Return a complete bundled sample synchronously for immediate rendering.
 */
export function getLocalSample(id: string): AnalysisData | null {
  if (!isSampleId(id)) return null;
  const data = samples[id];
  return isCompleteAnalysisData(data) ? data : null;
}

/**
 * Load a predefined example from GitHub, rejecting incomplete responses.
 */
export async function loadGitHubSample(id: string): Promise<AnalysisData> {
  if (!isSampleId(id)) {
    throw new Error(`Unknown predefined example "${id}".`);
  }

  const response = await fetch(buildGitHubUrl(id), {
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) {
    throw new Error(`GitHub sample fetch failed for ${id}: ${response.status} ${response.statusText}`);
  }

  const payload: unknown = await response.json();
  if (!isCompleteAnalysisData(payload)) {
    throw new Error(`GitHub sample "${id}" did not contain a complete analysis dataset.`);
  }
  return payload;
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

// ----- GitHub URL helpers -----

/**
 * Build the raw GitHub URL for a given sample id.
 * Useful for debugging or direct linking.
 */
export function buildGitHubUrl(id: string, repo: string = DEFAULT_REPO ?? '', branch: string = DATA_BRANCH): string {
  if (!repo) return '';
  return `${GITHUB_RAW}/${repo}/${branch}/data/${id}.json`;
}

/**
 * Check if GitHub data source is configured.
 */
export function isGitHubConfigured(): boolean {
  return !!DEFAULT_REPO;
}

function isCompleteAnalysisData(value: unknown): value is AnalysisData {
  if (typeof value !== 'object' || value === null) return false;
  const data = value as Record<string, unknown>;
  const arrays = [
    'competitors',
    'products',
    'pricingTiers',
    'marketGaps',
    'insights',
    'recommendations',
    'actionPlan',
    'reports',
    'sources',
  ];
  const profile = data.profile;
  const charts = data.charts;
  const chartKeys = [
    'marketShare',
    'marketSharePie',
    'growth',
    'growthPie',
    'pricing',
    'pricingPie',
    'featureAdoption',
    'featureAdoptionPie',
  ];
  return typeof data.businessName === 'string'
    && isRecord(profile)
    && typeof profile.businessName === 'string'
    && typeof profile.idea === 'string'
    && typeof profile.industry === 'string'
    && typeof data.industry === 'string'
    && typeof data.idea === 'string'
    && arrays.every((key) => Array.isArray(data[key]))
    && isRecord(charts)
    && chartKeys.every((key) => {
      const chart = charts[key];
      return isRecord(chart) && Array.isArray(chart.series);
    });
}

function isSampleId(id: string): id is SampleId {
  return id === 'perfume' || id === 'protein';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
