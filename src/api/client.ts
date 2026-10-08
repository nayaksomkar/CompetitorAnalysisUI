import type { ActionId, ContextualAction } from '../actions';
import { isActionId } from '../actions';
import { getActiveBaseUrl } from '../components/EndpointSettings';
import { getLocalSample, loadSample } from '../data/github-loader';
import type { SampleId } from '../data';
import type {
  ActionPlanItem,
  AnalysisData,
  BusinessProfile,
  ChartData,
  ChartSeries,
  Competitor,
  InsightItem,
  MarketGap,
  OrchestratorResponse,
  Product,
  PricingTier,
  Report,
  Source,
  AnalysisMetric,
} from '../types';

export interface ActionResult {
  response: OrchestratorResponse;
}

export interface BootstrapResult {
  data: AnalysisData;
  missingData: NonNullable<OrchestratorResponse['missing_data']>;
}

export interface ApiClient {
  getLocalSample(sampleId: SampleId): AnalysisData | null;
  loadSample(sampleId: SampleId): Promise<AnalysisData>;
  bootstrap(profile: BusinessProfile): Promise<BootstrapResult>;
  executeAction(action: ContextualAction, data: AnalysisData): Promise<ActionResult>;
}

class OrchestratorApi implements ApiClient {
  getLocalSample(sampleId: SampleId): AnalysisData | null {
    return getLocalSample(sampleId);
  }

  async loadSample(sampleId: SampleId): Promise<AnalysisData> {
    return loadSample(sampleId);
  }

  async bootstrap(profile: BusinessProfile): Promise<BootstrapResult> {
    const response = await fetch(`${getActiveBaseUrl()}/api/v1/parser/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        parser_input: {
          intent: 'bootstrap',
          form_input: {
            business_name: profile.businessName,
            idea: profile.idea,
            industry: profile.industry,
            products_services: profile.productsServices ?? [],
            target_customers: profile.targetCustomers ?? '',
            geography: profile.geography ?? '',
            pricing: profile.pricing ?? '',
            business_model: profile.businessModel ?? '',
            competitors: profile.competitors ?? [],
            differentiators: profile.differentiators ?? '',
            research_goals: profile.researchGoals ?? [],
          },
          requested_count: Math.min(profile.competitors?.length || 3, 3),
        },
      }),
      signal: AbortSignal.timeout(100000),
    });

    if (!response.ok) {
      const details = await response.text();
      throw new Error(`CompetitorEngine returned ${response.status}${details ? `: ${details.slice(0, 200)}` : ''}`);
    }

    const payload: unknown = await response.json();
    if (!isOrchestratorResponse(payload)) {
      throw new Error('CompetitorEngine returned an invalid bootstrap response.');
    }
    if (payload.status === 'error') {
      throw new Error(payload.error ?? 'CompetitorEngine could not complete this analysis.');
    }
    if (!isRecord(payload.data)) {
      throw new Error('CompetitorEngine returned no analysis data.');
    }

    return {
      data: mapAnalysisData(payload.data, profile),
      missingData: payload.missing_data ?? [],
    };
  }

  async executeAction(action: ContextualAction, data: AnalysisData): Promise<ActionResult> {
    if (!isActionId(action.action)) {
      throw new Error('Unsupported action.');
    }
    if (!action.entity.trim()) {
      throw new Error('An action requires a selected entity.');
    }
    if (action.action === 'compare_competitors' && !action.target?.trim()) {
      throw new Error('Choose a competitor to compare.');
    }

    const structuredAction: { action: ActionId; entity: string; section: ContextualAction['section']; target?: string } = {
      action: action.action,
      entity: action.entity,
      section: action.section,
      ...(action.target ? { target: action.target } : {}),
    };
    const intent = action.action === 'compare_competitors'
      ? 'compare'
      : action.action.startsWith('explain_')
        ? 'explain'
        : 'question';

    const response = await fetch(`${getActiveBaseUrl()}/api/v1/parser/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        parser_input: {
          intent,
          action: structuredAction,
          session_id: `ui-${crypto.randomUUID()}`,
          context_update: {
            version: 1,
            business: {
              name: data.profile.businessName,
              industry: data.profile.industry,
              pricing: data.profile.pricing,
              model: data.profile.businessModel,
              idea: data.profile.idea,
            },
            entities: {
              competitors: data.competitors.map((competitor) => competitor.id),
              focus: action.entity,
            },
            result_meta: {
              requested_count: data.competitors.length,
              retrieved_count: data.competitors.length,
              filters: [],
            },
            constraints: { included: [], excluded: [] },
            keywords: [data.profile.industry],
          },
          current_analysis: {
            business: {
              name: data.profile.businessName,
              industry: data.profile.industry,
              pricing: data.profile.pricing,
              model: data.profile.businessModel,
              idea: data.profile.idea,
            },
            competitors: data.competitors,
            pricingTiers: data.pricingTiers,
            marketGaps: data.marketGaps,
            insights: data.insights,
            charts: data.charts,
            sources: data.sources,
          },
          form_input: {
            business_name: data.profile.businessName,
            idea: data.profile.idea,
            industry: data.profile.industry,
          },
        },
      }),
      signal: AbortSignal.timeout(100000),
    });

    if (!response.ok) {
      const details = await response.text();
      throw new Error(`Orchestrator returned ${response.status}${details ? `: ${details.slice(0, 200)}` : ''}`);
    }

    const payload: unknown = await response.json();
    if (!isOrchestratorResponse(payload)) {
      throw new Error('The orchestrator returned an invalid action response.');
    }
    if (payload.status === 'error') {
      throw new Error(payload.error ?? 'The orchestrator could not complete this action.');
    }
    return { response: payload };
  }
}

export const api: ApiClient = new OrchestratorApi();

function mapAnalysisData(raw: Record<string, unknown>, profile: BusinessProfile): AnalysisData {
  const chartsRaw = record(raw.charts);
  const charts = mapCharts(chartsRaw, raw.charts);
  const competitors = list(raw.competitors).map(mapCompetitor).filter(isPresent);
  const insights = list(raw.insights).map(mapInsight).filter(isPresent);
  const recommendations = list(raw.recommendations ?? raw.action_items).map(mapInsight).filter(isPresent);
  const marketGaps = list(raw.marketGaps ?? raw.market_gaps).map(mapMarketGap).filter(isPresent);
  const sources = list(raw.sources).map(mapSource).filter(isPresent);
  const reportValue = raw.reports ?? raw.report;
  const reports = list(reportValue).map(mapReport).filter(isPresent);

  return {
    businessName: profile.businessName,
    industry: profile.industry,
    idea: profile.idea,
    businessSummary: text(raw.business_summary) || undefined,
    executiveSummary: text(raw.executive_summary) || (typeof raw.report === 'string' ? raw.report : undefined),
    positioning: text(raw.positioning) || undefined,
    metricCards: list(raw.metric_cards).map(mapMetric).filter(isPresent),
    targetCustomers: profile.targetCustomers,
    geography: profile.geography,
    pricing: profile.pricing,
    businessModel: profile.businessModel,
    differentiators: profile.differentiators,
    researchGoals: profile.researchGoals,
    profile,
    competitors,
    products: list(raw.products).map(mapProduct).filter(isPresent),
    pricingTiers: list(raw.pricingTiers ?? raw.pricing_tiers).map(mapPricingTier).filter(isPresent),
    marketGaps,
    insights,
    recommendations,
    actionPlan: list(raw.actionPlan ?? raw.action_plan).map(mapActionPlanItem).filter(isPresent),
    reports,
    charts,
    swot: mapSwot(raw.swot),
    sources,
  };
}

function mapCompetitor(value: unknown): Competitor | null {
  if (!isRecord(value)) return null;
  const name = text(value.name);
  if (!name) return null;
  return {
    id: text(value.id) || slug(name),
    name,
    logoColor: text(value.logoColor ?? value.logo_color) || undefined,
    description: text(value.description) || '',
    funding: text(value.funding) || undefined,
    founded: text(value.founded) || undefined,
    hq: text(value.hq) || undefined,
    marketShare: numeric(value.marketShare ?? value.market_share),
    growthRate: numeric(value.growthRate ?? value.growth_rate),
    pricingTier: text(value.pricingTier ?? value.pricing_tier) || undefined,
    marketPosition: oneOf(value.marketPosition ?? value.market_position, ['Leader', 'Challenger', 'Niche', 'Emerging']),
    strengths: strings(value.strengths),
    weaknesses: strings(value.weaknesses),
    swot: mapSwot(value.swot) ?? { strengths: [], weaknesses: [], opportunities: [], threats: [] },
  };
}

function mapProduct(value: unknown): Product | null {
  if (!isRecord(value)) return null;
  const name = text(value.name);
  if (!name) return null;
  return {
    id: text(value.id) || slug(name),
    competitorId: text(value.competitorId ?? value.competitor_id) || undefined,
    name,
    tagline: text(value.tagline) || undefined,
    category: text(value.category) || undefined,
    pricingModel: text(value.pricingModel ?? value.pricing_model) || undefined,
    startingPrice: numeric(value.startingPrice ?? value.starting_price),
    features: list(value.features).flatMap((feature, index) => {
      if (!isRecord(feature)) return [];
      const featureName = text(feature.name);
      if (!featureName) return [];
      return [{
        id: text(feature.id) || `${slug(name)}-feature-${index}`,
        name: featureName,
        description: text(feature.description) || '',
        maturity: oneOf(feature.maturity, ['Beta', 'GA', 'Deprecated', 'Roadmap']),
        adoption: numeric(feature.adoption),
      }];
    }),
  };
}

function mapPricingTier(value: unknown): PricingTier | null {
  if (!isRecord(value)) return null;
  const name = text(value.name);
  if (!name) return null;
  const price = value.priceMonthly ?? value.price_monthly;
  return {
    id: text(value.id) || slug(name),
    competitorId: text(value.competitorId ?? value.competitor_id) || undefined,
    name,
    priceMonthly: typeof price === 'number' || typeof price === 'string' ? price : undefined,
    billing: oneOf(value.billing, ['monthly', 'yearly']),
    features: strings(value.features),
    bestFor: text(value.bestFor ?? value.best_for) || undefined,
    pricingModel: text(value.pricingModel ?? value.pricing_model) || undefined,
    highlighted: typeof value.highlighted === 'boolean' ? value.highlighted : undefined,
  };
}

function mapMarketGap(value: unknown): MarketGap | null {
  if (!isRecord(value)) return null;
  const title = text(value.title);
  if (!title) return null;
  return {
    id: text(value.id) || slug(title),
    title,
    description: text(value.description) || '',
    opportunityScore: numeric(value.opportunityScore ?? value.opportunity_score),
    difficultyScore: numeric(value.difficultyScore ?? value.difficulty_score),
    estimatedRevenue: text(value.estimatedRevenue ?? value.estimated_revenue) || undefined,
    affectedSegments: strings(value.affectedSegments ?? value.affected_segments),
  };
}

function mapMetric(value: unknown): AnalysisMetric | null {
  if (!isRecord(value)) return null;
  const label = text(value.label ?? value.title ?? value.name);
  const metricValue = value.value;
  if (!label || (typeof metricValue !== 'string' && typeof metricValue !== 'number')) return null;
  return {
    id: text(value.id) || slug(label),
    label,
    value: metricValue,
    change: text(value.change) || undefined,
  };
}

function mapInsight(value: unknown): InsightItem | null {
  if (!isRecord(value)) return null;
  const title = text(value.title);
  if (!title) return null;
  return {
    id: text(value.id) || slug(title),
    title,
    category: oneOf(value.category, ['Opportunity', 'Risk', 'Trend', 'Recommendation', 'Insight']),
    impact: oneOf(value.impact, ['High', 'Medium', 'Low']),
    confidence: numeric(value.confidence),
    summary: text(value.summary) || text(value.description) || '',
    detail: text(value.detail) || undefined,
    relatedCompetitors: strings(value.relatedCompetitors ?? value.related_competitors),
  };
}

function mapActionPlanItem(value: unknown): ActionPlanItem | null {
  if (!isRecord(value)) return null;
  const title = text(value.title);
  if (!title) return null;
  return {
    id: text(value.id) || slug(title),
    title,
    owner: text(value.owner) || undefined,
    priority: oneOf(value.priority, ['P0', 'P1', 'P2']),
    horizon: oneOf(value.horizon, ['Now', 'Next', 'Later']),
    effort: oneOf(value.effort, ['Low', 'Medium', 'High']),
    impact: oneOf(value.impact, ['Low', 'Medium', 'High']),
    description: text(value.description) || '',
    rationale: text(value.rationale) || undefined,
  };
}

function mapReport(value: unknown): Report | null {
  if (!isRecord(value)) return null;
  const title = text(value.title);
  if (!title) return null;
  return {
    id: text(value.id) || slug(title),
    title,
    type: oneOf(value.type, ['Executive Summary', 'Deep Dive', 'Market Landscape', 'Go-to-Market']),
    date: text(value.date) || undefined,
    pages: numeric(value.pages),
    summary: text(value.summary) || '',
    sections: list(value.sections).flatMap((section) => {
      if (!isRecord(section)) return [];
      const heading = text(section.heading);
      if (!heading) return [];
      return [{ heading, body: text(section.body) || '' }];
    }),
  };
}

function mapSource(value: unknown): Source | null {
  if (!isRecord(value)) return null;
  const title = text(value.title);
  if (!title) return null;
  return {
    id: text(value.id) || slug(title),
    title,
    url: text(value.url) || undefined,
    publisher: text(value.publisher) || undefined,
    date: text(value.date) || undefined,
    snippet: text(value.snippet) || undefined,
  };
}

function mapCharts(charts: Record<string, unknown>, rawCharts: unknown): AnalysisData['charts'] {
  const chartList = list(rawCharts);
  const chartFor = (key: string, title: string, kind: ChartData['kind']): ChartData => {
    const chartName = key.replace(/Pie$/, '').replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase().replace(/[^a-z0-9]/g, '');
    const keyedChart = charts[key] ?? Object.entries(charts).find(([name]) =>
      name.toLowerCase().replace(/[^a-z0-9]/g, '') === key.toLowerCase().replace(/[^a-z0-9]/g, ''),
    )?.[1];
    const raw = keyedChart ?? chartList.find((item) => {
      if (!isRecord(item)) return false;
      const itemName = text(item.title ?? item.name).toLowerCase().replace(/[^a-z0-9]/g, '');
      const itemKind = text(item.kind ?? item.chart_type).toLowerCase();
      return itemName.includes(chartName) && (key.endsWith('Pie') ? itemKind === 'pie' : itemKind !== 'pie');
    });
    if (!isRecord(raw)) return { title, kind, series: [] };
    const labels = strings(raw.labels);
    const rawKind = raw.kind ?? raw.chart_type;
    const rawSeries = list(raw.series ?? raw.datasets);
    return {
      title: text(raw.title) || title,
      kind: oneOf(rawKind, ['bar', 'line', 'area', 'radar', 'pie']) ?? kind,
      xLabel: text(raw.xLabel ?? raw.x_label) || undefined,
      yLabel: text(raw.yLabel ?? raw.y_label) || undefined,
      series: rawSeries.flatMap((entry, seriesIndex): ChartSeries[] => {
        if (!isRecord(entry)) return [];
        const rawPoints = list(entry.points ?? entry.data);
        const points = rawPoints.flatMap((point, pointIndex) => {
          if (isRecord(point) && text(point.label) && numeric(point.value) !== undefined) {
            return [{ label: text(point.label), value: numeric(point.value)!, color: text(point.color) || undefined }];
          }
          const values = list(entry.values ?? entry.data);
          const value = numeric(values[pointIndex]);
          return value === undefined || !labels[pointIndex]
            ? []
            : [{ label: labels[pointIndex], value, color: undefined }];
        });
        return [{
          id: text(entry.id) || `${key}-${seriesIndex}`,
          name: text(entry.name) || `Series ${seriesIndex + 1}`,
          color: text(entry.color) || text(entry.fill) || '#10b981',
          points,
        }];
      }),
    };
  };

  return {
    marketShare: chartFor('marketShare', 'Market Share', 'bar'),
    marketSharePie: chartFor('marketSharePie', 'Market Share', 'pie'),
    growth: chartFor('growth', 'Growth', 'line'),
    growthPie: chartFor('growthPie', 'Growth', 'pie'),
    pricing: chartFor('pricing', 'Pricing', 'bar'),
    pricingPie: chartFor('pricingPie', 'Pricing', 'pie'),
    featureAdoption: chartFor('featureAdoption', 'Feature Adoption', 'radar'),
    featureAdoptionPie: chartFor('featureAdoptionPie', 'Feature Adoption', 'pie'),
  };
}

function mapSwot(value: unknown): AnalysisData['swot'] {
  if (!isRecord(value)) return undefined;
  return {
    strengths: strings(value.strengths),
    weaknesses: strings(value.weaknesses),
    opportunities: strings(value.opportunities),
    threats: strings(value.threats),
  };
}

function isOrchestratorResponse(value: unknown): value is OrchestratorResponse {
  return isRecord(value)
    && (value.status === 'success' || value.status === 'partial' || value.status === 'error');
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function record(value: unknown): Record<string, unknown> {
  return isRecord(value) ? value : {};
}

function list(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function text(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function strings(value: unknown): string[] {
  return list(value).filter((item): item is string => typeof item === 'string');
}

function numeric(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function slug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function oneOf<const T extends readonly string[]>(value: unknown, options: T): T[number] | undefined {
  return typeof value === 'string' ? options.find((option) => option === value) : undefined;
}

function isPresent<T>(value: T | null): value is T {
  return value !== null;
}
