// =============================================================================
// Data module entry point.
//
// Exports:
//  - samples: Static map of locally bundled JSON data (for offline/dev use)
//  - sampleList: Array of sample metadata for the Questionnaire
//  - SampleId: Union type of available sample ids
//  - loadSample / getSampleList: Async loaders (GitHub or local JSON)
//
// Usage:
//  import { loadSample, sampleList } from './data';
//  const data = await loadSample('perfume');
// =============================================================================

import type { AnalysisData, BusinessProfile } from '../types';

export type SampleId = 'perfume' | 'protein';

// Re-export the async loader and helpers
export {
  loadSample,
  getSampleList,
  refreshSample,
  clearCache,
  isGitHubConfigured,
  buildGitHubUrl,
} from './github-loader';

export type { SampleMeta } from './github-loader';

// ----- Static JSON imports (bundled data for offline/dev use) -----

import perfumeJson from './perfume.json';
import proteinJson from './protein.json';

/** Bundled sample data — always available as fallback. */
export const samples: Record<SampleId, AnalysisData> = {
  perfume: perfumeJson as unknown as AnalysisData,
  protein: proteinJson as unknown as AnalysisData,
};

/** Sample metadata for the Questionnaire. */
export const sampleList: { id: SampleId; label: string; profile: BusinessProfile }[] = [
  { id: 'perfume', label: `${samples.perfume.businessName} — ${samples.perfume.industry}`, profile: samples.perfume.profile },
  { id: 'protein', label: `${samples.protein.businessName} — ${samples.protein.industry}`, profile: samples.protein.profile },
];
