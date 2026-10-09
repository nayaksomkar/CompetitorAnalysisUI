import { useMemo } from 'react';
import { Chart } from './Chart';
import { Badge } from './primitives';
import { Stat } from './Stat';
import { CompetitorCard } from './CompetitorCard';
import { ComparisonTable } from './ComparisonTable';
import { PricingTable } from './PricingTable';
import { InsightCard, MarketGapCard, ActionPlanList, SourcesList } from './AssetCards';
import { SafeText } from './SafeText';
import type { AnalysisData, ChartData } from '../types';

const PALETTE = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export function OverviewDashboard({ data, focusText }: { data: AnalysisData; focusText?: string }) {
  const { profile, competitors, insights, marketGaps, charts, actionPlan, sources, reports, pricingTiers } = data;

  // Build radar chart data from competitor metrics (no invented numbers)
  const radarChart: ChartData | null = useMemo(() => {
  if (competitors.length < 2) return null;
  const dimensions = [
    {
      label: 'Share',
      value: (competitor: (typeof competitors)[number]) => competitor.marketShare,
    },
    {
      label: 'Growth',
      value: (competitor: (typeof competitors)[number]) => competitor.growthRate,
    },
  ].filter((dimension) => competitors.every(
    (competitor) => dimension.value(competitor) !== undefined,
  ));
  if (!dimensions.length) return null;
  return {
  title: 'Competitor Positioning',
  kind: 'radar',
  series: competitors.map((c, i) => ({
  id: c.id,
  name: c.name,
  color: PALETTE[i % PALETTE.length],
  points: dimensions.flatMap((dimension) => {
    const value = dimension.value(c);
    return value === undefined
      ? []
      : [{ label: dimension.label, value: Math.min(value, 100) }];
  }),
  })),
  };
  }, [competitors]);

  const competitorTable = competitors.length > 0 ? {
  title: 'Competitor Comparison',
  columns: ['Vendor', 'Share', 'Growth', 'Pricing tier', 'Position', 'Weakness'],
  rows: competitors.map((c) => ({
  name: c.name,
  cells: [percent(c.marketShare), percent(c.growthRate), c.pricingTier ?? '—', c.marketPosition ?? '—', c.weaknesses?.[0] ?? '—'],
  })),
  } : null;

  // Reorder sections based on focusText
  const lowerFocus = focusText?.toLowerCase() ?? '';
  const focusMatchesCompetitor = competitors.find((c) => lowerFocus.includes(c.name.toLowerCase()));
  const isPricingFocus = lowerFocus.includes('pricing') || lowerFocus.includes('price');
  const isGapFocus = lowerFocus.includes('gap') || lowerFocus.includes('opportunity');

  const overviewCharts = [
    charts.marketSharePie.series.length > 0 ? charts.marketSharePie : charts.marketShare,
    charts.growthPie.series.length > 0 ? charts.growthPie : charts.growth,
    charts.pricingPie.series.length > 0 ? charts.pricingPie : charts.pricing,
    charts.featureAdoption,
  ].filter((chart) => chart.series.length > 0);

  const visibleInsights = insights ?? [];
  const opportunities = visibleInsights.filter((i) => i.category === 'Opportunity' || i.category === 'Recommendation');
  const risks = visibleInsights.filter((i) => i.category === 'Risk');
  const trends = visibleInsights.filter((i) => i.category === 'Trend');

  const sectionClass = 'space-y-3';

  return (
  <div className="max-w-7xl w-full mx-auto space-y-4 py-4">
  {/* Executive Summary */}
  <div className={sectionClass}>
  <h3 className="text-sm font-semibold text-ink-700  uppercase tracking-wide">Executive Summary</h3>
  {(data.executiveSummary || data.businessSummary) && (
    <SafeText text={data.executiveSummary || data.businessSummary} className="text-sm text-ink-700 leading-relaxed" />
  )}
  {data.positioning && (
    <p className="text-sm text-ink-600"><span className="font-medium text-ink-800">Positioning:</span> {data.positioning}</p>
  )}
  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
  <Stat label="Competitors" value={competitors.length} />
  <Stat label="Market gaps" value={marketGaps.length} />
  <Stat label="Insights" value={visibleInsights.length} />
  <Stat label="Sources" value={sources.length} />
  <Stat label="Reports" value={reports.length} />
  <Stat label="Goals" value={profile.researchGoals?.length ?? 0} />
  </div>
  {data.metricCards && data.metricCards.length > 0 && (
  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
  {data.metricCards.map((metric) => (
  <div key={metric.id} className="rounded-xl border border-ink-100 bg-white px-3 py-2">
  <p className="text-xs text-ink-500">{metric.label}</p>
  <p className="text-lg font-semibold text-ink-900">{metric.value}</p>
  {metric.change && <p className="text-xs text-ink-500">{metric.change}</p>}
  </div>
  ))}
  </div>
  )}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
  {visibleInsights[0] && <InsightCard item={visibleInsights[0]} compact />}
  {marketGaps[0] && (
  <div className="rounded-xl border border-ink-100  p-3 bg-white ">
  <Badge tone="violet">Top gap</Badge>
  <p className="text-sm font-medium text-ink-900  mt-1.5">{marketGaps[0].title}</p>
  <p className="text-xs text-ink-600  mt-0.5 line-clamp-2">{marketGaps[0].description}</p>
  </div>
  )}
  </div>
  </div>

  {/* Competitor section first if focused or if gap focus */}
  {(focusMatchesCompetitor || !isPricingFocus) && competitors.length > 0 && (
  <div className={sectionClass}>
  <h3 className="text-sm font-semibold text-ink-700  uppercase tracking-wide">
  {focusMatchesCompetitor ? `${focusMatchesCompetitor.name} — Deep Dive` : 'Competitors'}
  </h3>
  <CompetitorGrid competitors={competitors} focusId={focusMatchesCompetitor?.id} />
  </div>
  )}

  {/* Market Overview charts */}
  {overviewCharts.length > 0 && (
  <div className={sectionClass}>
  <h3 className="text-sm font-semibold text-ink-700  uppercase tracking-wide">Market Overview</h3>
  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
  {overviewCharts.map((chart) => <Chart key={chart.title} data={chart} />)}
  </div>
  </div>
  )}

  {/* Competitor comparison table */}
  {competitorTable && (
  <div className={sectionClass}>
  <h3 className="text-sm font-semibold text-ink-700  uppercase tracking-wide">Side-by-Side</h3>
  <ComparisonTable data={competitorTable} />
  </div>
  )}

  {/* Radar positioning */}
  {radarChart && (
  <div className={sectionClass}>
  <h3 className="text-sm font-semibold text-ink-700  uppercase tracking-wide">Competitor Positioning</h3>
  <div className="max-w-md"><Chart data={radarChart} /></div>
  </div>
  )}

  {/* Pricing section — first if focused */}
  {isPricingFocus && pricingTiers.length > 0 && (
  <div className={sectionClass}>
  <h3 className="text-sm font-semibold text-ink-700  uppercase tracking-wide">Pricing</h3>
  <PricingTable title="All pricing tiers" tiers={pricingTiers} />
  </div>
  )}

  {/* Market Gaps */}
  {(marketGaps.length > 0 || isGapFocus) && marketGaps.length > 0 && (
  <div className={sectionClass}>
  <h3 className="text-sm font-semibold text-ink-700  uppercase tracking-wide">Market Gaps</h3>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
  {marketGaps.map((g) => <MarketGapCard key={g.id} gap={g} />)}
  </div>
  </div>
  )}

  {/* Insights & Recommendations */}
  {(opportunities.length > 0 || risks.length > 0 || trends.length > 0) && (
  <div className={sectionClass}>
  <h3 className="text-sm font-semibold text-ink-700  uppercase tracking-wide">Insights & Recommendations</h3>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
  {[...opportunities, ...risks, ...trends].map((i) => <InsightCard key={i.id} item={i} />)}
  </div>
  </div>
  )}

  {/* Action Plan */}
  {actionPlan.length > 0 && (
  <div className={sectionClass}>
  <h3 className="text-sm font-semibold text-ink-700  uppercase tracking-wide">Action Plan</h3>
  <ActionPlanList title={`${profile.businessName} — 90-day action plan`} items={actionPlan} />
  </div>
  )}

  {/* Sources */}
  {sources.length > 0 && (
  <div className={sectionClass}>
  <h3 className="text-sm font-semibold text-ink-700  uppercase tracking-wide">Sources</h3>
  <SourcesList sources={sources} />
  </div>
  )}
  </div>
  );
}

function percent(value: number | undefined): string {
  return value === undefined ? '—' : `${value}%`;
}

function CompetitorGrid({ competitors, focusId }: { competitors: AnalysisData['competitors']; focusId?: string }) {
  const sorted = focusId ? [...competitors].sort((a, b) => (a.id === focusId ? -1 : b.id === focusId ? 1 : 0)) : competitors;
  return (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
  {sorted.map((c) => (
  <div key={c.id} className={c.id === focusId ? 'lg:col-span-2' : ''}>
  <CompetitorCard competitor={c} expanded={c.id === focusId} />
  </div>
  ))}
  </div>
  );
}
