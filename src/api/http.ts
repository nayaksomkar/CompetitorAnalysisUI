// =============================================================================
// HTTP client that talks to the real backend.
//
// The backend contract (from the API team):
//
//  GET  /health
//  → { status: "ok" }
//
//  POST /api/v1/analyze
//  Request: {
//  business_name, idea, industry (required)
//  products_services[], target_customers, geography,
//  pricing, business_model, competitors[], differentiators,
//  research_goals[], user_query?
//  }
//
//  Response: {
//  competitors, swot, charts, comparisons,
//  insights, recommendations, action_plan,
//  report, sources,
//  // every item includes an `explanation` for "Explain This"
//  }
//
// All views consume `AnalysisData` (see src/types.ts), so this client is
// responsible for translating the wire format into our internal shape.
// =============================================================================

import type {
  AnalysisData,
  BusinessProfile,
  ChatAsset,
} from '../types';
import type {
  AskOptions,
  AskResult,
  ApiClient,
} from './client';
import type { SampleId } from '../data';
import { samples } from '../data';

// Wire-shape types — kept separate from the UI types so a backend rename
// never reaches into a view. Update these once and you're done.

interface AnalyzeRequest {
  business_name: string;
  idea: string;
  industry: string;
  products_services?: string[];
  target_customers?: string;
  geography?: string;
  pricing?: string;
  business_model?: string;
  competitors?: string[];
  differentiators?: string;
  research_goals?: string[];
  user_query?: string;
}

interface SourceWire {
  id?: string;
  title: string;
  url?: string;
  publisher?: string;
  date?: string;
  snippet?: string;
}

interface ExplanationWire {
  summary?: string;
  why_it_matters?: string[];
  evidence?: { label?: string; detail?: string }[];
  sources?: SourceWire[];
}

interface AnalyzeResponse {
  competitors?: Array<{
  id?: string;
  name: string;
  description?: string;
  logo_color?: string;
  funding?: string;
  founded?: string;
  hq?: string;
  market_share?: number;
  growth_rate?: number;
  pricing_tier?: string;
  market_position?: string;
  strengths?: string[];
  weaknesses?: string[];
  swot?: { strengths?: string[]; weaknesses?: string[]; opportunities?: string[]; threats?: string[] };
  explanation?: ExplanationWire;
  }>;
  swot?: { strengths?: string[]; weaknesses?: string[]; opportunities?: string[]; threats?: string[] };
  charts?: Array<{
  title?: string;
  chart_type?: 'bar' | 'radar' | 'pie' | 'line' | 'area';
  labels?: string[];
  datasets?: Array<{ name?: string; color?: string; values?: number[] }>;
  explanation?: ExplanationWire;
  }>;
  comparisons?: Array<{
  title?: string;
  columns?: string[];
  rows?: Array<{ name: string; cells: (string | number | boolean)[] }>;
  explanation?: ExplanationWire;
  }>;
  insights?: Array<{
  id?: string;
  title: string;
  category?: string;
  impact?: 'High' | 'Medium' | 'Low';
  confidence?: number;
  summary?: string;
  detail?: string;
  related_competitors?: string[];
  explanation?: ExplanationWire;
  }>;
  recommendations?: Array<{
  id?: string;
  title: string;
  summary?: string;
  detail?: string;
  explanation?: ExplanationWire;
  }>;
  action_plan?: Array<{
  id?: string;
  title: string;
  owner?: string;
  priority?: 'P0' | 'P1' | 'P2';
  horizon?: 'Now' | 'Next' | 'Later';
  effort?: 'Low' | 'Medium' | 'High';
  impact?: 'Low' | 'Medium' | 'High';
  description?: string;
  rationale?: string;
  }>;
  report?: {
  title?: string;
  type?: 'Executive Summary' | 'Deep Dive' | 'Market Landscape' | 'Go-to-Market';
  date?: string;
  pages?: number;
  summary?: string;
  sections?: { heading: string; body: string }[];
  explanation?: ExplanationWire;
  };
  sources?: SourceWire[];
  // Free-form chat reply fields (only used for `ask()`).
  chat_reply?: { text?: string; assets?: ChatAsset[] };
}

// ----- Mappers: wire → internal -----

const mapExplanation = (e?: ExplanationWire): import('../types').Explanation => ({
  summary: e?.summary ?? '',
  whyItMatters: e?.why_it_matters ?? [],
  evidence: (e?.evidence ?? []).map((x) => ({ label: x?.label ?? '', detail: x?.detail ?? '' })),
  sources: (e?.sources ?? []).map((s, i) => ({
  id: s.id ?? `src-${i}`,
  title: s.title,
  url: s.url,
  publisher: s.publisher,
  date: s.date,
  snippet: s.snippet,
  })),
});

const mapCompetitor = (c: NonNullable<AnalyzeResponse['competitors']>[number]) => ({
  id: c.id ?? c.name.toLowerCase().replace(/\s+/g, '-'),
  name: c.name,
  logoColor: c.logo_color ?? 'bg-ink-700',
  description: c.description ?? '',
  funding: c.funding,
  founded: c.founded,
  hq: c.hq,
  marketShare: c.market_share ?? 0,
  growthRate: c.growth_rate ?? 0,
  pricingTier: (c.pricing_tier ?? 'Paid') as import('../types').Competitor['pricingTier'],
  marketPosition: (c.market_position ?? 'Niche') as import('../types').Competitor['marketPosition'],
  strengths: c.strengths ?? [],
  weaknesses: c.weaknesses ?? [],
  swot: {
  strengths: c.swot?.strengths ?? [],
  weaknesses: c.swot?.weaknesses ?? [],
  opportunities: c.swot?.opportunities ?? [],
  threats: c.swot?.threats ?? [],
  },
  explanation: mapExplanation(c.explanation),
});

const mapChart = (ch: NonNullable<AnalyzeResponse['charts']>[number], idx: number): import('../types').ChartData => {
  const kind = (ch.chart_type ?? 'bar') as 'bar' | 'line' | 'area' | 'radar' | 'pie';
  const labels = ch.labels ?? [];
  const datasets = ch.datasets ?? [];
  return {
  title: ch.title ?? `Chart ${idx + 1}`,
  kind,
  xLabel: '',
  yLabel: '',
  series: datasets.map((d, di) => ({
  id: `s-${idx}-${di}`,
  name: d.name ?? `Series ${di + 1}`,
  color: d.color ?? pickColor(di),
  points: labels.map((l, li) => ({ label: l, value: d.values?.[li] ?? 0 })),
  })),
  explanation: mapExplanation(ch.explanation),
  };
};

// Fallback palette if the backend omits per-series colors.
const palette = ['#10a37f', '#3b82f6', '#f43f5e', '#f59e0b', '#8b5cf6', '#0ea5e9'];
const pickColor = (i: number) => palette[i % palette.length];

// ----- HTTP client -----

export class HttpApi implements ApiClient {
  constructor(private readonly opts: { baseUrl: string; fetchImpl?: typeof fetch } = { baseUrl: '' }) {}

  private get fetchFn(): typeof fetch {
  return this.opts.fetchImpl ?? fetch;
  }

  /** Quick liveness check — useful for the UI's connection status. */
  async health(): Promise<boolean> {
  try {
  const r = await this.fetchFn(`${this.opts.baseUrl}/health`);
  return r.ok;
  } catch {
  return false;
  }
  }

  async bootstrap(profile: BusinessProfile, _sampleId: SampleId): Promise<AnalysisData> {
  const req: AnalyzeRequest = {
  business_name: profile.businessName,
  idea: profile.idea,
  industry: profile.industry,
  products_services: profile.productsServices,
  target_customers: profile.targetCustomers,
  geography: profile.geography,
  pricing: profile.pricing,
  business_model: profile.businessModel,
  competitors: profile.competitors,
  differentiators: profile.differentiators,
  research_goals: profile.researchGoals,
  };
  const wire = await this.post<AnalyzeResponse>('/api/v1/analyze', req);
  return wireToAnalysis(wire, profile, _sampleId);
  }

  async ask({ prompt, context }: AskOptions): Promise<AskResult> {
  const profile = context?.profile;
  const req: AnalyzeRequest = {
  business_name: profile?.businessName ?? 'Unknown',
  idea: profile?.idea ?? '',
  industry: profile?.industry ?? '',
  products_services: profile?.productsServices,
  target_customers: profile?.targetCustomers,
  geography: profile?.geography,
  pricing: profile?.pricing,
  business_model: profile?.businessModel,
  competitors: profile?.competitors,
  differentiators: profile?.differentiators,
  research_goals: profile?.researchGoals,
  user_query: prompt,
  };
  const wire = await this.post<AnalyzeResponse>('/api/v1/analyze', req);
  const analysis = wireToAnalysis(wire, profile, undefined);
  if (wire.chat_reply?.assets?.length) {
  return { text: wire.chat_reply.text ?? '', assets: wire.chat_reply.assets };
  }
  return { text: wire.chat_reply?.text ?? analysis.reports[0]?.summary ?? '', assets: [] };
  }

  async regenerate(): Promise<ChatAsset[]> {
  // The current backend returns the full analysis in `ask()`; regenerate
  // can re-call it or be extended with a dedicated endpoint later.
  return [];
  }

  private async post<T>(path: string, body: unknown): Promise<T> {
  const res = await this.fetchFn(`${this.opts.baseUrl}${path}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${path} failed: ${res.status} ${res.statusText}`);
  return (await res.json()) as T;
  }
}

// ----- Wire → AnalysisData -----

function wireToAnalysis(wire: AnalyzeResponse, profile?: BusinessProfile, sampleId?: SampleId): AnalysisData {
  // Always start from a known-good base so partial responses still render.
  const base = sampleId ? samples[sampleId] : samples.perfume;
  const competitors = (wire.competitors ?? []).map(mapCompetitor);
  const insights = (wire.insights ?? []).map((i) => ({
  id: i.id ?? i.title.toLowerCase().replace(/\s+/g, '-'),
  title: i.title,
  category: (i.category ?? 'Insight') as import('../types').InsightItem['category'],
  impact: (i.impact ?? 'Medium') as import('../types').InsightItem['impact'],
  confidence: i.confidence ?? 70,
  summary: i.summary ?? '',
  detail: i.detail ?? '',
  relatedCompetitors: i.related_competitors ?? [],
  explanation: mapExplanation(i.explanation),
  }));
  const recommendations = (wire.recommendations ?? []).map((r) => ({
  id: r.id ?? r.title.toLowerCase().replace(/\s+/g, '-'),
  title: r.title,
  category: 'Recommendation' as const,
  impact: 'Medium' as const,
  confidence: 75,
  summary: r.summary ?? '',
  detail: r.detail ?? '',
  relatedCompetitors: [],
  explanation: mapExplanation(r.explanation),
  }));
  const chartsList = (wire.charts ?? []).map(mapChart);
  // Our UI expects named charts; map by position with fallbacks.
  const charts = {
  marketShare: chartsList[0] ?? base.charts.marketShare,
  marketSharePie: base.charts.marketSharePie,
  growth: chartsList[1] ?? base.charts.growth,
  growthPie: base.charts.growthPie,
  pricing: chartsList[2] ?? base.charts.pricing,
  pricingPie: base.charts.pricingPie,
  featureAdoption: chartsList[3] ?? base.charts.featureAdoption,
  featureAdoptionPie: base.charts.featureAdoptionPie,
  };
  const swot = wire.swot
  ? {
  strengths: wire.swot.strengths ?? [],
  weaknesses: wire.swot.weaknesses ?? [],
  opportunities: wire.swot.opportunities ?? [],
  threats: wire.swot.threats ?? [],
  }
  : undefined;

  return {
  ...base,
  businessName: profile?.businessName ?? base.businessName,
  industry: profile?.industry ?? base.industry,
  idea: profile?.idea ?? base.idea,
  targetCustomers: profile?.targetCustomers ?? base.targetCustomers,
  geography: profile?.geography ?? base.geography,
  pricing: profile?.pricing ?? base.pricing,
  businessModel: profile?.businessModel ?? base.businessModel,
  differentiators: profile?.differentiators ?? base.differentiators,
  researchGoals: profile?.researchGoals ?? base.researchGoals,
  profile: {
  businessName: profile?.businessName ?? base.profile.businessName,
  idea: profile?.idea ?? base.profile.idea,
  industry: profile?.industry ?? base.profile.industry,
  productsServices: profile?.productsServices ?? base.profile.productsServices,
  targetCustomers: profile?.targetCustomers ?? base.profile.targetCustomers,
  geography: profile?.geography ?? base.profile.geography,
  pricing: profile?.pricing ?? base.profile.pricing,
  businessModel: profile?.businessModel ?? base.profile.businessModel,
  competitors: profile?.competitors ?? base.profile.competitors,
  differentiators: profile?.differentiators ?? base.profile.differentiators,
  researchGoals: profile?.researchGoals ?? base.profile.researchGoals,
  },
  competitors: competitors.length ? competitors : base.competitors,
  insights: insights.length ? insights : base.insights,
  recommendations: recommendations.length ? recommendations : base.recommendations,
  charts,
  swot,
  sources: (wire.sources ?? []).length
  ? (wire.sources ?? []).map((s, i) => ({
  id: s.id ?? `s-${i}`,
  title: s.title,
  url: s.url,
  publisher: s.publisher,
  date: s.date,
  snippet: s.snippet,
  }))
  : base.sources,
  conversation: base.conversation,
  };
}