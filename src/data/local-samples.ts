import type { AnalysisData, BusinessProfile } from '../types';
import perfumeJson from './perfume.json';
import proteinJson from './protein.json';

export type SampleId = 'perfume' | 'protein';

export const samples: Record<SampleId, AnalysisData> = {
  perfume: perfumeJson as unknown as AnalysisData,
  protein: proteinJson as unknown as AnalysisData,
};

export const sampleList: { id: SampleId; label: string; profile: BusinessProfile }[] = [
  { id: 'perfume', label: `${samples.perfume.businessName} — ${samples.perfume.industry}`, profile: samples.perfume.profile },
  { id: 'protein', label: `${samples.protein.businessName} — ${samples.protein.industry}`, profile: samples.protein.profile },
];
