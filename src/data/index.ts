// =============================================================================
// Data module entry point.
//
// Exports:
//  - samples: Static map of locally bundled JSON data for legacy/offline use
//  - sampleList: Array of sample metadata for the Questionnaire
//  - SampleId: Union type of available sample ids
//  - loadGitHubSample: Strict GitHub-only loader for predefined examples
//  - loadSample / getSampleList: Legacy loaders (GitHub or local JSON)
//
// Usage:
//  import { loadGitHubSample, sampleList } from './data';
//  const data = await loadGitHubSample('perfume');
// =============================================================================

export type { SampleId } from './local-samples';

// Re-export the async loader and helpers
export {
  getLocalSample,
  loadSample,
  loadGitHubSample,
  getSampleList,
  refreshSample,
  clearCache,
  isGitHubConfigured,
  buildGitHubUrl,
} from './github-loader';

export type { SampleMeta } from './github-loader';
export { sampleList, samples } from './local-samples';
