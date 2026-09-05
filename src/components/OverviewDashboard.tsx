import { useMemo } from 'react';
import { Chart } from './Chart';
import { Badge } from './primitives';
import { Stat } from './Stat';
import { CompetitorCard } from './CompetitorCard';
import { ComparisonTable } from './ComparisonTable';
import { PricingTable } from './PricingTable';
import { InsightCard, MarketGapCard, ActionPlanList, SourcesList } from './AssetCards';
import type { AnalysisData, ChartData } from '../types';

const PALETTE = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export function OverviewDashboard({ data, focusText }: { data: AnalysisData; focusText?: string }) {
  const { profile, competitors, insights, marketGaps, charts, actionPlan, sources, reports, pricingTiers } = data;

  // Build radar chart data from competitor metrics (no invented numbers)
  const radarChart: ChartData | null = useMemo(() => {
    if (competitors.length < 2) return null;
    return {
      title: 'Competitor Positioning',
      kind: 'radar',
      series: competitors.map((c, i) => ({
        id: c.id,
        name: c.name,
        color: PALETTE[i % PALETTE.length],
        points: [
          { label: 'Share', value: Math.min(c.marketShare ?? 0, 100) },
          { label: 'Growth', value: Math.min(c.growthRate ?? 0, 100) },
          { label: 'Strengths', value: Math.min((c.strengths?.length ?? 0) * 25, 100) },
          { label: 'Weaknesses', value: Math.min((c.weaknesses?.length ?? 0) * 25, 100) },
          { label: 'Opportunities', value: Math.min((c.swot?.opportunities?.length ?? 0) * 25, 100) },
          { label: 'Threats', value: Math.min((c.swot?.threats?.length ?? 0) * 25, 100) },
        ],
      })),
    };
  }, [competitors]);

  const competitorTable = competitors.length > 0 ? {
    title: 'Competitor Comparison',
    columns: ['Vendor', 'Share', 'Growth', 'Pricing tier', 'Position', 'Weakness'],
    rows: competitors.map((c) => ({
      name: c.name,
      cells: [`${c.marketShare ?? '—'}%`, `${c.growthRate ?? '—'}%`, c.pricingTier ?? '—', c.marketPosition ?? '—', c.weaknesses?.[0] ?? '—'],
    })),
  } : null;

  // Reorder sections based on focusText
  const lowerFocus = focusText?.toLowerCase() ?? '';
  const focusMatchesCompetitor = competitors.find((c) => lowerFocus.includes(c.name.toLowerCase()));
  const isPricingFocus = lowerFocus.includes('pricing') || lowerFocus.includes('price');
  const isGapFocus = lowerFocus.includes('gap') || lowerFocus.includes('opportunity');

  const visibleInsights = insights ?? [];
  const opportunities = visibleInsights.filter((i) => i.category === 'Opportunity' || i.category === 'Recommendation');
  const risks = visibleInsights.filter((i) => i.category === 'Risk');
  const trends = visibleInsights.filter((i) => i.category === 'Trend');

  const sectionClass = 'space-y-3';

  return (
    <div className="max-w-7xl w-full mx-auto space-y-4 py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-ink-900 dark:text-ink-100">{profile.businessName} — Overview</h2>
          <p className="text-sm text-ink-500 dark:text-ink-400 mt-0.5 line-clamp-2">{profile.idea}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          {profile.industry && <Badge tone="green">{profile.industry}</Badge>}
          {profile.geography && <Badge tone="gray">{profile.geography}</Badge>}
        </div>
      </div>

      {/* Executive Summary */}
      <div className={sectionClass}>
        <h3 className="text-sm font-semibold text-ink-700 dark:text-ink-300 uppercase tracking-wide">Executive Summary</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          <Stat label="Competitors" value={competitors.length} />
          <Stat label="Market gaps" value={marketGaps.length} />
          <Stat label="Insights" value={visibleInsights.length} />
          <Stat label="Sources" value={sources.length} />
          <Stat label="Reports" value={reports.length} />
          <Stat label="Goals" value={profile.researchGoals?.length ?? 0} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {visibleInsights[0] && <InsightCard item={visibleInsights[0]} compact />}
          {marketGaps[0] && (
            <div className="rounded-xl border border-ink-100 dark:border-ink-700 p-3 bg-white dark:bg-ink-800">
              <Badge tone="violet">Top gap</Badge>
              <p className="text-sm font-medium text-ink-900 dark:text-ink-100 mt-1.5">{marketGaps[0].title}</p>
              <p className="text-xs text-ink-600 dark:text-ink-400 mt-0.5 line-clamp-2">{marketGaps[0].description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Competitor section first if focused or if gap focus */}
      {(focusMatchesCompetitor || !isPricingFocus) && competitors.length > 0 && (
        <div className={sectionClass}>
          <h3 className="text-sm font-semibold text-ink-700 dark:text-ink-300 uppercase tracking-wide">
            {focusMatchesCompetitor ? `${focusMatchesCompetitor.name} — Deep Dive` : 'Competitors'}
          </h3>
          <CompetitorGrid competitors={competitors} focusId={focusMatchesCompetitor?.id} />
        </div>
      )}

      {/* Market Overview charts */}
      {(charts.marketSharePie || charts.growthPie || charts.pricingPie) && (
        <div className={sectionClass}>
          <h3 className="text-sm font-semibold text-ink-700 dark:text-ink-300 uppercase tracking-wide">Market Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {charts.marketSharePie && <Chart data={charts.marketSharePie} />}
            {charts.growthPie && <Chart data={charts.growthPie} />}
            {charts.pricingPie && <Chart data={charts.pricingPie} />}
          </div>
        </div>
      )}

      {/* Competitor comparison table */}
      {competitorTable && (
        <div className={sectionClass}>
          <h3 className="text-sm font-semibold text-ink-700 dark:text-ink-300 uppercase tracking-wide">Side-by-Side</h3>
          <ComparisonTable data={competitorTable} />
        </div>
      )}

      {/* Radar positioning */}
      {radarChart && (
        <div className={sectionClass}>
          <h3 className="text-sm font-semibold text-ink-700 dark:text-ink-300 uppercase tracking-wide">Competitor Positioning</h3>
          <div className="max-w-md"><Chart data={radarChart} /></div>
        </div>
      )}

      {/* Pricing section — first if focused */}
      {isPricingFocus && pricingTiers.length > 0 && (
        <div className={sectionClass}>
          <h3 className="text-sm font-semibold text-ink-700 dark:text-ink-300 uppercase tracking-wide">Pricing</h3>
          <PricingTable title="All pricing tiers" tiers={pricingTiers} />
        </div>
      )}

      {/* Market Gaps */}
      {(marketGaps.length > 0 || isGapFocus) && marketGaps.length > 0 && (
        <div className={sectionClass}>
          <h3 className="text-sm font-semibold text-ink-700 dark:text-ink-300 uppercase tracking-wide">Market Gaps</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {marketGaps.map((g) => <MarketGapCard key={g.id} gap={g} />)}
          </div>
        </div>
      )}

      {/* Insights & Recommendations */}
      {(opportunities.length > 0 || risks.length > 0 || trends.length > 0) && (
        <div className={sectionClass}>
          <h3 className="text-sm font-semibold text-ink-700 dark:text-ink-300 uppercase tracking-wide">Insights & Recommendations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[...opportunities, ...risks, ...trends].map((i) => <InsightCard key={i.id} item={i} />)}
          </div>
        </div>
      )}

      {/* Action Plan */}
      {actionPlan.length > 0 && (
        <div className={sectionClass}>
          <h3 className="text-sm font-semibold text-ink-700 dark:text-ink-300 uppercase tracking-wide">Action Plan</h3>
          <ActionPlanList title={`${profile.businessName} — 90-day action plan`} items={actionPlan} />
        </div>
      )}

      {/* Sources */}
      {sources.length > 0 && (
        <div className={sectionClass}>
          <h3 className="text-sm font-semibold text-ink-700 dark:text-ink-300 uppercase tracking-wide">Sources</h3>
          <SourcesList sources={sources} />
        </div>
      )}
    </div>
  );
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
