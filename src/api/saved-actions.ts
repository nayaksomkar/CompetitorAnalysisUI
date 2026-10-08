import type {
  AnalysisData,
  AnswerBlock,
  Competitor,
  OrchestratorResponse,
  Source,
} from '../types';
import type { ContextualAction } from '../actions';

type Evidence = NonNullable<AnswerBlock['evidence']>;

export function resolveSavedAction(
  action: ContextualAction,
  data: AnalysisData,
): OrchestratorResponse | null {
  const competitor = findCompetitor(data, action.entity);

  switch (action.action) {
    case 'show_pricing':
      return showPricing(action, data, competitor);
    case 'show_market_position':
      return showMarketPosition(action, data, competitor);
    case 'show_weaknesses':
      return showList('weaknesses', competitor?.swot.weaknesses.length
        ? competitor.swot.weaknesses
        : competitor?.weaknesses ?? (isBusiness(action.entity, data) ? data.swot?.weaknesses : undefined), action.entity);
    case 'show_strengths':
      return showList('strengths', competitor?.swot.strengths.length
        ? competitor.swot.strengths
        : competitor?.strengths ?? (isBusiness(action.entity, data) ? data.swot?.strengths : undefined), action.entity);
    case 'compare_competitors':
      return compareCompetitors(action, data);
    case 'show_sources':
      return showSources(action, data, competitor);
    case 'show_price_gaps':
      return showPriceGaps(data);
    case 'explain_premium_positioning':
      return explainChart(data.charts.pricing, data);
    case 'show_market_share':
      return showChart(data.charts.marketShare, 'Market share');
    case 'show_growth':
      return showChart(data.charts.growth, 'Growth');
    case 'show_underlying_data':
      return showChart(chartForAction(action, data), 'Underlying data');
    case 'explain_trend':
      return explainChart(chartForAction(action, data), data);
    case 'show_market_gap':
    case 'explain_opportunity':
    case 'show_supporting_evidence':
      return showMarketGaps(action, data);
    case 'show_affected_competitors':
      return showAffectedCompetitors(action, data);
    case 'show_supporting_data':
    case 'explore_implications':
      return showInsightData(action, data);
    case 'explore_related_products':
      return showRelatedProducts(action, data);
    default:
      return null;
  }
}

function showPricing(
  action: ContextualAction,
  data: AnalysisData,
  competitor: Competitor | undefined,
): OrchestratorResponse | null {
  const isPrimaryBusiness = isBusiness(action.entity, data);
  const product = data.products.find((item) => same(item.name, action.entity));
  const tiers = competitor
    ? data.pricingTiers.filter((tier) => tier.competitorId === competitor.id)
    : isPrimaryBusiness
      ? data.pricingTiers
      : product
        ? data.pricingTiers.filter((tier) => same(tier.name, product.name) || tier.name.toLowerCase().includes(product.name.toLowerCase()))
        : [];
  const chartPoints = data.charts.pricing.series.flatMap((series) => series.points)
    .filter((point) => competitor
      ? same(point.label, competitor.name) || point.label.toLowerCase().includes(competitor.name.toLowerCase())
      : isPrimaryBusiness
        ? true
        : Boolean(product && (same(point.label, product.name) || point.label.toLowerCase().includes(product.name.toLowerCase()))));
  const evidence: Evidence = tiers.flatMap((tier) => {
    const details = [
      tier.priceMonthly !== undefined ? `Price: ${String(tier.priceMonthly)}` : '',
      tier.billing ? `Billing: ${tier.billing}` : '',
      tier.bestFor ? `Best for: ${tier.bestFor}` : '',
      ...tier.features,
    ].filter(Boolean);
    return details.length ? [{ label: tier.name, detail: details.join(' · ') }] : [];
  });

  if (product?.startingPrice !== undefined) {
    evidence.push({ label: product.name, detail: `Starting price: ${String(product.startingPrice)}` });
  }
  for (const point of chartPoints) {
    evidence.push({ label: point.label, detail: `${data.charts.pricing.title}: ${point.value}` });
  }
  if (isPrimaryBusiness && data.profile.pricing) {
    evidence.push({ label: data.profile.businessName, detail: data.profile.pricing });
  }
  if (!evidence.length && !tiers.length) return null;

  return response(
    `Saved pricing information for ${action.entity}.`,
    evidence,
    data.charts.pricing.explanation?.sources,
    { pricingTiers: tiers, pricingChart: data.charts.pricing },
  );
}

function showMarketPosition(
  action: ContextualAction,
  data: AnalysisData,
  competitor: Competitor | undefined,
): OrchestratorResponse | null {
  if (competitor) {
    const evidence: Evidence = [];
    if (competitor.marketPosition) evidence.push({ label: 'Market position', detail: competitor.marketPosition });
    if (competitor.marketShare !== undefined) evidence.push({ label: 'Market share', detail: `${competitor.marketShare}%` });
    if (competitor.growthRate !== undefined) evidence.push({ label: 'Year-over-year growth', detail: `${competitor.growthRate}%` });
    if (competitor.pricingTier) evidence.push({ label: 'Pricing tier', detail: competitor.pricingTier });
    if (competitor.description) evidence.push({ label: 'Profile', detail: competitor.description });
    if (!evidence.length) return null;
    return response(
      competitor.explanation?.summary || `Saved market position for ${competitor.name}.`,
      evidence,
      competitor.explanation?.sources,
      { competitor },
    );
  }

  if (!isBusiness(action.entity, data)) return null;
  const evidence: Evidence = [];
  if (data.positioning) evidence.push({ label: 'Positioning', detail: data.positioning });
  for (const metric of data.metricCards ?? []) {
    evidence.push({ label: metric.label, detail: `${String(metric.value)}${metric.change ? ` (${metric.change})` : ''}` });
  }
  if (!evidence.length) return null;
  return response(`Saved market position for ${data.businessName}.`, evidence, data.sources, { positioning: data.positioning });
}

function showList(
  label: string,
  items: string[] | undefined,
  entity: string,
): OrchestratorResponse | null {
  if (!items?.length) return null;
  const singular = label === 'weaknesses' ? 'Weakness' : 'Strength';
  return response(
    `Saved ${label} for ${entity}.`,
    items.map((detail, index) => ({ label: `${singular} ${index + 1}`, detail })),
  );
}

function compareCompetitors(action: ContextualAction, data: AnalysisData): OrchestratorResponse | null {
  if (!action.target) return null;
  const subject = findCompetitor(data, action.entity);
  const target = findCompetitor(data, action.target);
  if (!subject || !target) return null;

  const evidence = [subject, target].flatMap((competitor) => [
    ...(competitor.marketPosition ? [{ label: `${competitor.name} · position`, detail: competitor.marketPosition }] : []),
    ...(competitor.marketShare !== undefined ? [{ label: `${competitor.name} · market share`, detail: `${competitor.marketShare}%` }] : []),
    ...(competitor.growthRate !== undefined ? [{ label: `${competitor.name} · growth`, detail: `${competitor.growthRate}%` }] : []),
    ...competitor.strengths.map((detail) => ({ label: `${competitor.name} · strength`, detail })),
    ...competitor.weaknesses.map((detail) => ({ label: `${competitor.name} · weakness`, detail })),
  ]);

  return response(
    `Comparison from the saved analysis: ${subject.name} and ${target.name}.`,
    evidence,
    [...(subject.explanation?.sources ?? []), ...(target.explanation?.sources ?? [])],
    {
      competitors: [toLookupCompetitor(subject)],
      comparedTo: [toLookupCompetitor(target)],
    },
  );
}

function showPriceGaps(data: AnalysisData): OrchestratorResponse | null {
  const points = data.charts.pricing.series.flatMap((series) => series.points);
  if (points.length < 2) return null;
  const sorted = [...points].sort((left, right) => left.value - right.value);
  const lowest = sorted[0];
  const highest = sorted[sorted.length - 1];
  return response(
    `Saved pricing spans ${lowest.value} to ${highest.value}; the observed gap is ${highest.value - lowest.value}.`,
    [
      { label: 'Lowest listed price', detail: `${lowest.label}: ${lowest.value}` },
      { label: 'Highest listed price', detail: `${highest.label}: ${highest.value}` },
      { label: 'Price gap', detail: String(highest.value - lowest.value) },
    ],
    data.charts.pricing.explanation?.sources,
    { chart: data.charts.pricing },
  );
}

function showMarketGaps(action: ContextualAction, data: AnalysisData): OrchestratorResponse | null {
  const gaps = data.marketGaps.filter((gap) =>
    same(gap.title, action.entity) || isBusiness(action.entity, data),
  );
  if (!gaps.length) return null;
  const evidence: Evidence = gaps.flatMap((gap) => [
    { label: gap.title, detail: gap.description },
    ...(gap.opportunityScore !== undefined ? [{ label: 'Opportunity score', detail: String(gap.opportunityScore) }] : []),
    ...(gap.difficultyScore !== undefined ? [{ label: 'Difficulty score', detail: String(gap.difficultyScore) }] : []),
    ...(gap.affectedSegments ?? []).map((segment) => ({ label: 'Affected segment', detail: segment })),
    ...(gap.explanation?.evidence ?? []),
  ]);
  return response(
    gaps.map((gap) => gap.explanation?.summary).filter(Boolean).join(' ') || `Saved market-gap analysis for ${action.entity}.`,
    evidence,
    gaps.flatMap((gap) => gap.explanation?.sources ?? []),
    { marketGaps: gaps },
  );
}

function showAffectedCompetitors(action: ContextualAction, data: AnalysisData): OrchestratorResponse | null {
  const insight = data.insights.find((item) => same(item.title, action.entity));
  const affected = data.competitors.filter((competitor) => insight?.relatedCompetitors?.some((id) => id === competitor.id || same(id, competitor.name)));
  if (!affected.length) return null;
  return response(
    `Competitors linked to ${action.entity} in the saved analysis.`,
    affected.map((competitor) => ({ label: competitor.name, detail: competitor.description })),
    insight?.explanation?.sources,
    { competitors: affected },
  );
}

function showInsightData(action: ContextualAction, data: AnalysisData): OrchestratorResponse | null {
  const insight = [...data.insights, ...data.recommendations].find((item) => same(item.title, action.entity));
  if (!insight) return null;
  const evidence = [
    { label: 'Insight', detail: insight.summary },
    ...(insight.detail ? [{ label: 'Details', detail: insight.detail }] : []),
    ...(insight.impact ? [{ label: 'Impact', detail: insight.impact }] : []),
    ...(insight.confidence !== undefined ? [{ label: 'Confidence', detail: String(insight.confidence) }] : []),
    ...(insight.explanation?.evidence ?? []),
  ];
  if (evidence.length === 1 && action.action === 'explore_implications') return null;
  return response(
    insight.explanation?.summary ?? `${action.action === 'explore_implications' ? 'Implications' : 'Supporting data'} for ${insight.title}.`,
    evidence,
    insight.explanation?.sources,
    { insight },
  );
}

function showRelatedProducts(action: ContextualAction, data: AnalysisData): OrchestratorResponse | null {
  const products = data.products.filter((product) =>
    same(product.name, action.entity) || product.category && same(product.category, action.entity),
  );
  if (!products.length) return null;
  const evidence = products.flatMap((product) => [
    ...(product.tagline ? [{ label: product.name, detail: product.tagline }] : []),
    ...(product.pricingModel ? [{ label: 'Pricing model', detail: product.pricingModel }] : []),
    ...product.features.map((feature) => ({ label: feature.name, detail: feature.description })),
  ]);
  return response(`Saved products related to ${action.entity}.`, evidence, undefined, { products });
}

function showSources(
  action: ContextualAction,
  data: AnalysisData,
  competitor: Competitor | undefined,
): OrchestratorResponse | null {
  const sources = competitor?.explanation?.sources.length
    ? competitor.explanation.sources
    : data.sources;
  if (!sources.length) return null;
  const evidence = sources.flatMap((source) => source.snippet
    ? [{ label: source.title, detail: source.snippet }]
    : []);
  return response(`Saved sources for ${action.entity}.`, evidence, sources, { sources });
}

function showChart(
  chart: AnalysisData['charts'][keyof AnalysisData['charts']],
  label: string,
): OrchestratorResponse | null {
  const points = chart.series.flatMap((series) =>
    series.points.map((point) => ({ label: `${series.name} · ${point.label}`, detail: String(point.value) })),
  );
  if (!points.length) return null;
  return response(chart.explanation?.summary ?? `${label} values from the saved analysis.`, points, chart.explanation?.sources, { chart });
}

function explainChart(
  chart: AnalysisData['charts'][keyof AnalysisData['charts']],
  data: AnalysisData,
): OrchestratorResponse | null {
  const explanation = chart.explanation;
  if (!explanation?.summary && !chart.series.some((series) => series.points.length)) return null;
  const evidence: Evidence = [
    ...(explanation?.whyItMatters ?? []).map((detail, index) => ({ label: `Why it matters ${index + 1}`, detail })),
    ...(explanation?.evidence ?? []),
  ];
  return response(
    explanation?.summary ?? `${chart.title} data from the saved analysis.`,
    evidence,
    explanation?.sources ?? data.sources,
    { chart },
    explanation?.summary,
  );
}

function chartForAction(
  action: ContextualAction,
  data: AnalysisData,
): AnalysisData['charts'][keyof AnalysisData['charts']] {
  const matched = Object.values(data.charts).find((chart) =>
    same(chart.title, action.entity) || chart.title.toLocaleLowerCase().includes(action.entity.toLocaleLowerCase()),
  );
  if (matched) return matched;
  if (action.section === 'pricing') return data.charts.pricing;
  if (action.section === 'chart' || action.section === 'insight') return data.charts.marketShare;
  return data.charts.growth;
}

function findCompetitor(data: AnalysisData, entity: string): Competitor | undefined {
  return data.competitors.find((competitor) => same(competitor.name, entity));
}

function isBusiness(entity: string, data: AnalysisData): boolean {
  return same(entity, data.businessName) || same(entity, data.profile.businessName);
}

function same(left: string, right: string): boolean {
  return left.trim().toLocaleLowerCase() === right.trim().toLocaleLowerCase();
}

function toLookupCompetitor(competitor: Competitor) {
  return {
    id: competitor.id,
    name: competitor.name,
    source: 'context' as const,
    profile: {
      description: competitor.description,
      pricingTier: competitor.pricingTier,
      marketPosition: competitor.marketPosition,
      marketShare: competitor.marketShare,
      growthRate: competitor.growthRate,
      funding: competitor.funding,
      founded: competitor.founded,
      hq: competitor.hq,
      strengths: competitor.strengths,
      weaknesses: competitor.weaknesses,
    },
    sources: competitor.explanation?.sources ?? [],
  };
}

function response(
  summary: string,
  evidence: Evidence,
  sources?: Source[],
  data?: Record<string, unknown>,
  explanation?: string,
): OrchestratorResponse {
  return {
    status: 'success',
    intent: 'saved_action',
    answer: {
      summary,
      evidence,
      ...(sources?.length ? { sources } : {}),
      ...(explanation ? { explanation } : {}),
    },
    ...(data ? { data } : {}),
  };
}
