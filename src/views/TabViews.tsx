import { useState } from 'react';
import { Card, Badge } from '../components/primitives';
import { Icon } from '../components/icons';
import { CompetitorCard } from '../components/CompetitorCard';
import { ComparisonTable } from '../components/ComparisonTable';
import { PricingTable } from '../components/PricingTable';
import { ProductBreakdown } from '../components/ProductBreakdown';
import { Chart } from '../components/Chart';
import { ExplainButton } from '../components/Explain';
import { InsightCard, MarketGapCard, ReportCard, ActionPlanList, SourcesList } from '../components/AssetCards';
import type { AnalysisData, Competitor, TabKey } from '../types';

export function TabContent({ tab, data }: { tab: TabKey; data: AnalysisData }) {
  switch (tab) {
    case 'chat':         return null;
    case 'overview':     return <Overview data={data} />;
    case 'competitors':  return <CompetitorsView data={data} />;
    case 'products':     return <ProductsView data={data} />;
    case 'pricing':      return <PricingView data={data} />;
    case 'market-gaps':  return <MarketGapsView data={data} />;
    case 'insights':     return <InsightsView data={data} />;
    case 'reports':      return <ReportsView data={data} />;
    case 'sources':      return <SourcesView data={data} />;
  }
}

function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <header className="px-6 pt-6 pb-3 border-b border-ink-100 flex items-center justify-between gap-3">
      <div>
        <h1 className="text-xl font-semibold text-ink-900">{title}</h1>
        {subtitle && <p className="text-sm text-ink-500 mt-1">{subtitle}</p>}
      </div>
      {action}
    </header>
  );
}

function Overview({ data }: { data: AnalysisData }) {
  const [activeChart, setActiveChart] = useState<'marketShare' | 'growth' | 'pricing' | 'featureAdoption'>('marketShare');
  const chartMap = {
    marketShare: data.charts.marketShare,
    growth: data.charts.growth,
    pricing: data.charts.pricing,
    featureAdoption: data.charts.featureAdoption,
  };

  return (
    <div className="overflow-y-auto scrollbar-thin h-full">
      <PageHeader
        title={`${data.profile.businessName} — Overview`}
        subtitle={data.profile.idea}
        action={
          <div className="flex items-center gap-2">
            <Badge tone="green">{data.profile.industry}</Badge>
            <Badge tone="gray">{data.profile.geography}</Badge>
          </div>
        }
      />

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Stat label="Competitors tracked" value={String(data.competitors.length)} />
          <Stat label="Market gaps" value={String(data.marketGaps.length)} />
          <Stat label="Insights" value={String(data.insights.length)} />
          <Stat label="Sources cited" value={String(data.sources.length)} />
          <Stat label="Reports ready" value={String(data.reports.length)} />
          <Stat label="Goals" value={String(data.profile.researchGoals?.length ?? 0)} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <div className="inline-flex rounded-lg border border-ink-200 p-0.5 text-xs mb-2 bg-white">
              {(Object.keys(chartMap) as Array<keyof typeof chartMap>).map((k) => (
                <button
                  key={k}
                  onClick={() => setActiveChart(k)}
                  className={`px-2.5 py-1 rounded-md ${activeChart === k ? 'bg-ink-900 text-white' : 'text-ink-700'}`}
                >
                  {chartMap[k].title.split('—')[0].trim()}
                </button>
              ))}
            </div>
            <Chart data={chartMap[activeChart]} />
          </div>
          <div className="space-y-3">
            <InsightCard item={data.insights[0]} />
            <InsightCard item={data.insights[1]} />
          </div>
        </div>

        <Card>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-ink-900">Top competitors at a glance</h3>
            <ExplainButton explanation={{ summary: 'A quick orientation across the competitors that matter most for your ICP.', whyItMatters: ['Use as the at-a-glance summary to share with new stakeholders.'], evidence: [{ label: 'Method', detail: 'Selection based on market share, growth and competitive fit.' }], sources: data.sources.slice(0, 3) }} />
          </div>
          <ComparisonTable
            data={{
              title: 'Competitors — at-a-glance',
              columns: ['Vendor', 'Share', 'Growth', 'Pricing tier', 'Position', 'Biggest weakness'],
              rows: data.competitors.map((c) => ({
                name: c.name,
                cells: [`${c.marketShare}%`, `${c.growthRate}%`, c.pricingTier ?? '—', c.marketPosition ?? '—', c.weaknesses?.[0] ?? '—'],
              })),
            }}
          />
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <MarketGapCard gap={data.marketGaps[0]} />
          <MarketGapCard gap={data.marketGaps[1]} />
        </div>

        <ActionPlanList
          title={`${data.profile.businessName} — 90-day action plan`}
          items={data.actionPlan}
          explanation={{
            summary: 'The three P0s ship in the next 60 days; P1s in the following quarter.',
            whyItMatters: [
              'Sequencing matters; the first move unlocks the others.',
              'Keep long-horizon items on a monthly review cadence.',
            ],
            evidence: [{ label: 'Source', detail: 'Internal synthesis of all evidence.' }],
            sources: data.sources.slice(0, 4),
          }}
        />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-ink-100 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">{label}</p>
      <p className="text-2xl font-semibold text-ink-900 mt-1">{value}</p>
    </div>
  );
}

function CompetitorsView({ data }: { data: AnalysisData }) {
  const [filter, setFilter] = useState<'All' | Competitor['marketPosition']>('All');
  const filtered = data.competitors.filter((c) => filter === 'All' || c.marketPosition === filter);
  return (
    <div className="overflow-y-auto scrollbar-thin h-full">
      <PageHeader
        title="Competitors"
        subtitle="Profiles, SWOTs, and side-by-side comparisons."
        action={
          <div className="inline-flex rounded-lg border border-ink-200 p-0.5 text-xs bg-white">
            {(['All', 'Leader', 'Challenger', 'Niche', 'Emerging'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-2.5 py-1 rounded-md ${filter === f ? 'bg-ink-900 text-white' : 'text-ink-700'}`}
              >
                {f}
              </button>
            ))}
          </div>
        }
      />
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((c) => <CompetitorCard key={c.id} competitor={c} />)}
        </div>
        <ComparisonTable
          data={{
            title: 'All competitors — at-a-glance',
            columns: ['Vendor', 'Share', 'Growth', 'Pricing tier', 'Position', 'HQ', 'Biggest weakness'],
            rows: data.competitors.map((c) => ({
              name: c.name,
              cells: [`${c.marketShare}%`, `${c.growthRate}%`, c.pricingTier ?? '—', c.marketPosition ?? '—', c.hq ?? '—', c.weaknesses?.[0] ?? '—'],
            })),
          }}
        />
      </div>
    </div>
  );
}

function ProductsView({ data }: { data: AnalysisData }) {
  const [active, setActive] = useState(data.products[0]?.id ?? '');
  const product = data.products.find((p) => p.id === active);
  return (
    <div className="overflow-y-auto scrollbar-thin h-full">
      <PageHeader title="Products" subtitle="Side-by-side product breakdowns." />
      <div className="p-6 space-y-4">
        <div className="flex flex-wrap gap-2">
          {data.products.map((p) => (
            <button
              key={p.id}
              onClick={() => setActive(p.id)}
              className={`pill border ${active === p.id ? 'bg-ink-900 text-white border-ink-900' : 'bg-white text-ink-700 border-ink-200 hover:border-ink-300'}`}
            >
              {p.name}
            </button>
          ))}
        </div>
        {product && <ProductBreakdown product={product} />}
      </div>
    </div>
  );
}

function PricingView({ data }: { data: AnalysisData }) {
  const [competitorId, setCompetitorId] = useState<string>('all');
  const filtered = competitorId === 'all' ? data.pricingTiers : data.pricingTiers.filter((t) => t.competitorId === competitorId);
  return (
    <div className="overflow-y-auto scrollbar-thin h-full">
      <PageHeader
        title="Pricing"
        subtitle="Compare price ladders across competitors."
        action={
          <div className="inline-flex rounded-lg border border-ink-200 p-0.5 text-xs bg-white">
            <button
              onClick={() => setCompetitorId('all')}
              className={`px-2.5 py-1 rounded-md ${competitorId === 'all' ? 'bg-ink-900 text-white' : 'text-ink-700'}`}
            >All</button>
            {data.competitors.map((c) => (
              <button
                key={c.id}
                onClick={() => setCompetitorId(c.id)}
                className={`px-2.5 py-1 rounded-md ${competitorId === c.id ? 'bg-ink-900 text-white' : 'text-ink-700'}`}
              >{c.name}</button>
            ))}
          </div>
        }
      />
      <div className="p-6 space-y-4">
        <PricingTable title={competitorId === 'all' ? 'All pricing tiers' : `${data.competitors.find((c) => c.id === competitorId)?.name} — pricing tiers`} tiers={filtered} />
        <Chart data={data.charts.pricing} />
      </div>
    </div>
  );
}

function MarketGapsView({ data }: { data: AnalysisData }) {
  return (
    <div className="overflow-y-auto scrollbar-thin h-full">
      <PageHeader title="Market Gaps" subtitle="Time-bounded openings with the highest opportunity." />
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.marketGaps.map((g) => <MarketGapCard key={g.id} gap={g} />)}
      </div>
    </div>
  );
}

function InsightsView({ data }: { data: AnalysisData }) {
  const [filter, setFilter] = useState<'All' | InsightCat>('All');
  const allItems = [...data.insights, ...data.recommendations];
  return (
    <div className="overflow-y-auto scrollbar-thin h-full">
      <PageHeader
        title="Insights & Recommendations"
        subtitle="What the analysis says — and why."
        action={
          <div className="inline-flex rounded-lg border border-ink-200 p-0.5 text-xs bg-white">
            {(['All', 'Opportunity', 'Risk', 'Trend', 'Recommendation'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-2.5 py-1 rounded-md ${filter === f ? 'bg-ink-900 text-white' : 'text-ink-700'}`}
              >{f}</button>
            ))}
          </div>
        }
      />
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {allItems.filter((i) => filter === 'All' || i.category === filter).map((i) => (
          <InsightCard key={i.id} item={i} />
        ))}
      </div>
    </div>
  );
}
type InsightCat = 'Opportunity' | 'Risk' | 'Trend' | 'Recommendation';

function ReportsView({ data }: { data: AnalysisData }) {
  return (
    <div className="overflow-y-auto scrollbar-thin h-full">
      <PageHeader title="Reports" subtitle="Board-ready summaries and deep dives." />
      <div className="p-6 space-y-4">
        {data.reports.map((r) => <ReportCard key={r.id} report={r} />)}
        <ActionPlanList
          title={`${data.profile.businessName} — 90-day action plan`}
          items={data.actionPlan}
          explanation={{
            summary: 'Three P0s in the next 60 days; P1s in the following quarter.',
            whyItMatters: ['Sequencing compounds impact.'],
            evidence: [{ label: 'Source', detail: 'Internal synthesis.' }],
            sources: data.sources.slice(0, 4),
          }}
        />
      </div>
    </div>
  );
}

function SourcesView({ data }: { data: AnalysisData }) {
  return (
    <div className="overflow-y-auto scrollbar-thin h-full">
      <PageHeader title="Sources" subtitle="Every claim links back to one of these." />
      <div className="p-6"><SourcesList sources={data.sources} /></div>
    </div>
  );
}

// Avoid unused import warnings
export { Icon };