// =============================================================================
// Shared domain types for the UI.
// Mirror of the backend wire contract in `src/api/http.ts` — keep both in sync.
//
// Naming convention: UI types use camelCase (e.g. `businessName`) which is the
// idiomatic shape the React components consume. The backend wire types in
// `src/api/http.ts` use snake_case (e.g. `business_name`) and are translated
// by `wireToAnalysis()` on the way in.
// =============================================================================

export type ID = string;

// ---------- Business profile (questionnaire) ----------

// Matches the backend `POST /api/v1/analyze` request body so the form state
// can be sent straight to the API.
export interface BusinessProfile {
  businessName: string;
  idea: string;
  industry: string;
  productsServices?: string[];
  targetCustomers?: string;
  geography?: string;
  pricing?: string;
  businessModel?: string;
  competitors?: string[];
  differentiators?: string;
  researchGoals?: string[];
}

// ---------- Sources & explanations (back every research asset) ----------

export interface Source {
  id: ID;
  title: string;
  url?: string;
  publisher?: string;
  date?: string;
  snippet?: string;
}

// "Explain this" payload. A real RAG pipeline returns the same shape.
export interface Explanation {
  summary: string;
  whyItMatters: string[];
  evidence: { label: string; detail: string }[];
  sources: Source[];
}

// ---------- Research assets ----------

export interface Competitor {
  id: ID;
  name: string;
  logoColor?: string;
  description: string;
  funding?: string;
  founded?: string;
  hq?: string;
  marketShare?: number;
  growthRate?: number;
  pricingTier?: string;
  marketPosition?: 'Leader' | 'Challenger' | 'Niche' | 'Emerging';
  strengths: string[];
  weaknesses: string[];
  swot: { strengths: string[]; weaknesses: string[]; opportunities: string[]; threats: string[] };
  explanation?: Explanation;
}

export interface ProductFeature {
  id: ID;
  name: string;
  description: string;
  maturity?: 'Beta' | 'GA' | 'Deprecated' | 'Roadmap';
  adoption?: number;
}

export interface Product {
  id: ID;
  competitorId?: ID;
  name: string;
  tagline?: string;
  category?: string;
  pricingModel?: string;
  startingPrice?: number;
  features: ProductFeature[];
  explanation?: Explanation;
}

export interface PricingTier {
  id: ID;
  competitorId?: ID;
  name: string;
  priceMonthly: number | 'Custom';
  billing?: 'monthly' | 'yearly';
  features: string[];
  bestFor?: string;
  pricingModel?: string;
  highlighted?: boolean;
}

export interface MarketGap {
  id: ID;
  title: string;
  description: string;
  opportunityScore: number;
  difficultyScore: number;
  estimatedRevenue?: string;
  affectedSegments?: string[];
  explanation?: Explanation;
}

export interface InsightItem {
  id: ID;
  title: string;
  category?: 'Opportunity' | 'Risk' | 'Trend' | 'Recommendation' | 'Insight';
  impact?: 'High' | 'Medium' | 'Low';
  confidence?: number;
  summary: string;
  detail?: string;
  relatedCompetitors?: ID[];
  explanation?: Explanation;
}

export interface ActionPlanItem {
  id: ID;
  title: string;
  owner?: string;
  priority?: 'P0' | 'P1' | 'P2';
  horizon?: 'Now' | 'Next' | 'Later';
  effort?: 'Low' | 'Medium' | 'High';
  impact?: 'Low' | 'Medium' | 'High';
  description: string;
  rationale?: string;
}

export interface ReportSection {
  heading: string;
  body: string;
}

export interface Report {
  id: ID;
  title: string;
  type?: 'Executive Summary' | 'Deep Dive' | 'Market Landscape' | 'Go-to-Market';
  date?: string;
  pages?: number;
  summary: string;
  sections: ReportSection[];
  explanation?: Explanation;
}

export interface ChartPoint { label: string; value: number; color?: string; }

export interface ChartSeries {
  id: ID;
  name: string;
  color: string;
  points: ChartPoint[];
}

export interface ChartData {
  title: string;
  kind: 'bar' | 'line' | 'area' | 'radar' | 'pie';
  xLabel?: string;
  yLabel?: string;
  series: ChartSeries[];
  explanation?: Explanation;
}

// ---------- Lookup (web-searched competitor) ----------

export interface LookupCompetitor {
  id: ID;
  name: string;
  source: 'web' | 'context';
  lookupConfidence?: number;
  profile: {
    description: string;
    pricingTier?: string;
    marketPosition?: 'Leader' | 'Challenger' | 'Niche' | 'Emerging' | 'unknown';
    marketShare?: number | null;
    growthRate?: number | null;
    funding?: string | null;
    founded?: string | null;
    hq?: string | null;
    strengths: string[];
    weaknesses: string[];
  };
  sources: Source[];
}

// ---------- Orchestrator response (parser/execute) ----------

export interface ContextUpdate {
  version: number;
  business: {
    name: string;
    industry: string;
    pricing?: string;
    model?: string;
  };
  entities: {
    competitors: string[];
    focus: string | null;
  };
  result_meta: {
    requested_count: number;
    retrieved_count: number;
    filters: string[];
  };
  constraints: {
    included: string[];
    excluded: string[];
  };
  keywords: string[];
}

export interface AnswerBlock {
  summary: string;
  competitors?: LookupCompetitor[];
  comparedTo?: LookupCompetitor[];
  question?: string;
  explanation?: string;
  evidence?: { label: string; detail: string }[];
  sources?: Source[];
}

export interface OrchestratorResponse {
  intent: string;
  status: 'success' | 'partial' | 'error';
  data: AnalysisData | null;
  answer: AnswerBlock | null;
  missing_data: { field: string; reason: string; severity: string }[];
  context_update: ContextUpdate | null;
  evicted_entities: string[];
  error: string | null;
  result_counts: {
    requested: number;
    retrieved: number;
    valid: number;
    displayed: number;
  };
  operations_performed: string[];
  entity_statuses: {
    competitors: {
      id: string;
      name: string;
      status: 'complete' | 'partial' | 'failed' | 'loading';
      missing_fields: string[];
      source?: 'web' | 'context';
      lookupConfidence?: number;
    }[];
  };
}

// ---------- Chat ----------

// Chat asset discriminated union. Adding a new asset kind? Add a case here,
// a renderer in `ChatView`, and place the "Explain this" button underneath.
export type ChatAsset =
  | { kind: 'competitor-card'; data: Competitor; explanation?: Explanation }
  | { kind: 'comparison-table'; data: { title: string; columns: string[]; rows: { name: string; cells: (string | number | boolean)[] }[] }; explanation?: Explanation }
  | { kind: 'pricing-table'; data: { title: string; tiers: PricingTier[] }; explanation?: Explanation }
  | { kind: 'product-breakdown'; data: Product; explanation?: Explanation }
  | { kind: 'chart'; data: ChartData; explanation?: Explanation }
  | { kind: 'swot'; data: { competitorId?: ID; swot: Competitor['swot']; competitorName?: string }; explanation?: Explanation }
  | { kind: 'market-gap'; data: MarketGap; explanation?: Explanation }
  | { kind: 'insight'; data: InsightItem; explanation?: Explanation }
  | { kind: 'report'; data: Report; explanation?: Explanation }
  | { kind: 'action-plan'; data: { title: string; items: ActionPlanItem[] }; explanation?: Explanation }
  | { kind: 'dashboard'; data: AnalysisData; focusText?: string }
  | { kind: 'lookup-card'; data: LookupCompetitor; explanation?: Explanation }
  | { kind: 'lookup-comparison'; data: { title: string; competitors: LookupCompetitor[] }; explanation?: Explanation };

export type ChatRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: ID;
  role: ChatRole;
  text?: string;
  assets?: ChatAsset[];
  createdAt: number;
  streaming?: boolean;
}

// ---------- Analysis payload (one per questionnaire submission) ----------

// Full analysis response. Shape mirrors the backend `POST /api/v1/analyze`
// response (after `wireToAnalysis()` translation). Views treat every entry as
// optional so a partial backend response still renders.
export interface AnalysisData {
  businessName: string;
  industry: string;
  idea: string;
  targetCustomers?: string;
  geography?: string;
  pricing?: string;
  businessModel?: string;
  differentiators?: string;
  researchGoals?: string[];

  profile: BusinessProfile;

  competitors: Competitor[];
  products: Product[];
  pricingTiers: PricingTier[];
  marketGaps: MarketGap[];
  insights: InsightItem[];
  recommendations: InsightItem[];
  actionPlan: ActionPlanItem[];
  reports: Report[];
  charts: {
  marketShare: ChartData;
  marketSharePie: ChartData;
  growth: ChartData;
  growthPie: ChartData;
  pricing: ChartData;
  pricingPie: ChartData;
  featureAdoption: ChartData;
  featureAdoptionPie: ChartData;
  };
  swot?: { strengths: string[]; weaknesses: string[]; opportunities: string[]; threats: string[] };
  sources: Source[];
  conversation: ChatMessage[];
}

// ---------- Tabs & samples ----------

export type TabKey =
  | 'chat'
  | 'overview'
  | 'competitors'
  | 'products'
  | 'pricing'
  | 'market-gaps'
  | 'insights'
  | 'reports'
  | 'sources';

export type SampleId = 'perfume' | 'protein';