import type { AnalysisData, BusinessProfile } from '../types';
import { perfumeAnalysis } from './perfume';
import { proteinAnalysis } from './protein';

export type SampleId = 'perfume' | 'protein';

export const samples: Record<SampleId, AnalysisData> = {
  perfume: perfumeAnalysis,
  protein: proteinAnalysis,
};

export const sampleList: { id: SampleId; label: string; profile: BusinessProfile }[] = [
  { id: 'perfume', label: 'Maison Velora — fragrance', profile: perfumeAnalysis.profile },
  { id: 'protein', label: 'Prota Foods — daily nutrition', profile: proteinAnalysis.profile },
];