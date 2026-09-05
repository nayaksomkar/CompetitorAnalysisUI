import { Card, Badge } from './primitives';
import { ExplainButton } from './Explain';
import { Icon } from './icons';
import type { InsightItem, MarketGap, Report, ActionPlanItem, Source } from '../types';

export function InsightCard({ item, compact }: { item: InsightItem; compact?: boolean }) {
  const catTone = item.category === 'Opportunity' ? 'green' : item.category === 'Risk' ? 'red' : item.category === 'Trend' ? 'blue' : 'violet';
  const impactTone = item.impact === 'High' ? 'red' : item.impact === 'Medium' ? 'amber' : 'gray';
  if (compact) {
    return (
      <Card className="p-3">
        <div className="flex items-center gap-2 mb-1">
          <Badge tone={catTone as 'green' | 'red' | 'blue' | 'violet'}>{item.category}</Badge>
          <span className="text-xs text-ink-500 dark:text-ink-400">{item.confidence}%</span>
        </div>
        <h4 className="font-medium text-sm text-ink-900 dark:text-ink-100 leading-snug">{item.title}</h4>
        <p className="text-xs text-ink-600 dark:text-ink-400 mt-1 line-clamp-2">{item.summary}</p>
      </Card>
    );
  }
  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge tone={catTone as 'green' | 'red' | 'blue' | 'violet'}>{item.category}</Badge>
          <Badge tone={impactTone as 'red' | 'amber' | 'gray'}>Impact: {item.impact}</Badge>
          <span className="text-xs text-ink-500 dark:text-ink-400 inline-flex items-center gap-1"><Icon.Target className="w-3.5 h-3.5" />{item.confidence}% confidence</span>
        </div>
        {item.explanation && <ExplainButton explanation={item.explanation} />}
      </div>
      <h3 className="font-semibold text-ink-900 dark:text-ink-100 mt-3">{item.title}</h3>
      <p className="text-sm text-ink-700 dark:text-ink-300 mt-1.5 leading-relaxed">{item.summary}</p>
      <p className="text-sm text-ink-600 dark:text-ink-400 mt-2 leading-relaxed">{item.detail}</p>
    </Card>
  );
}

export function MarketGapCard({ gap }: { gap: MarketGap }) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <Badge tone="violet">Market gap</Badge>
          {gap.estimatedRevenue && <Badge tone="gray">{gap.estimatedRevenue}</Badge>}
        </div>
        {gap.explanation && <ExplainButton explanation={gap.explanation} />}
      </div>
      <h3 className="font-semibold text-ink-900 dark:text-ink-100 mt-3">{gap.title}</h3>
      <p className="text-sm text-ink-700 dark:text-ink-300 mt-1.5 leading-relaxed">{gap.description}</p>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <Score label="Opportunity" value={gap.opportunityScore} accent="green" />
        <Score label="Difficulty" value={gap.difficultyScore} accent="rose" />
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {gap.affectedSegments?.map((s) => (
          <Badge key={s} tone="blue">{s}</Badge>
        ))}
      </div>
    </Card>
  );
}

function Score({ label, value, accent }: { label: string; value: number; accent: 'green' | 'rose' }) {
  const color = accent === 'green' ? 'bg-emerald-500' : 'bg-rose-500';
  return (
    <div className="rounded-lg bg-ink-50/60 dark:bg-ink-700/50 p-3">
      <div className="flex items-center justify-between text-xs text-ink-500 dark:text-ink-400 mb-1.5">
        <span>{label}</span>
        <span className="font-semibold text-ink-900 dark:text-ink-100">{value}/100</span>
      </div>
      <div className="h-1.5 rounded-full bg-ink-100 dark:bg-ink-600 overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export function ReportCard({ report }: { report: Report }) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge tone="blue">{report.type}</Badge>
          <Badge tone="gray">{report.pages} pages</Badge>
          <span className="text-xs text-ink-500 dark:text-ink-400">{report.date}</span>
        </div>
        {report.explanation && <ExplainButton explanation={report.explanation} />}
      </div>
      <h3 className="font-semibold text-ink-900 dark:text-ink-100 mt-3">{report.title}</h3>
      <p className="text-sm text-ink-700 dark:text-ink-300 mt-1.5">{report.summary}</p>
      <ul className="mt-4 space-y-3">
        {report.sections.map((s) => (
          <li key={s.heading} className="border-l-2 border-ink-200 dark:border-ink-600 pl-3">
            <p className="text-xs font-semibold text-ink-500 dark:text-ink-400 uppercase tracking-wide">{s.heading}</p>
            <p className="text-sm text-ink-700 dark:text-ink-300 mt-0.5">{s.body}</p>
          </li>
        ))}
      </ul>
    </Card>
  );
}

export function ActionPlanList({
  title,
  items,
  explanation,
}: {
  title: string;
  items: ActionPlanItem[];
  explanation?: import('../types').Explanation;
}) {
  const order = ['P0', 'P1', 'P2'] as const;
  const grouped: Record<string, ActionPlanItem[]> = { P0: [], P1: [], P2: [] };
  for (const i of items) {
    const p = i.priority ?? 'P2';
    grouped[p].push(i);
  }

  return (
    <Card padded={false}>
      <div className="flex items-center justify-between p-5 border-b border-ink-100 dark:border-ink-700">
        <h3 className="font-semibold text-ink-900 dark:text-ink-100">{title}</h3>
        {explanation && <ExplainButton explanation={explanation} />}
      </div>
      <div className="p-5 space-y-6">
        {order.map((p) =>
          grouped[p].length === 0 ? null : (
            <div key={p}>
              <div className="flex items-center gap-2 mb-2">
                <span className={`pill ${p === 'P0' ? 'bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border border-rose-100 dark:border-rose-800' : p === 'P1' ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-800' : 'bg-ink-50 dark:bg-ink-700 text-ink-600 dark:text-ink-400 border border-ink-100 dark:border-ink-600'}`}>
                  {p === 'P0' ? 'Ship now' : p === 'P1' ? 'Next' : 'Later'}
                </span>
                <span className="text-xs text-ink-500 dark:text-ink-400">{grouped[p].length} item{grouped[p].length === 1 ? '' : 's'}</span>
              </div>
              <ul className="space-y-2">
                {grouped[p].map((i) => (
                  <li key={i.id} className="rounded-xl border border-ink-100 dark:border-ink-700 hover:border-ink-200 dark:hover:border-ink-600 hover:shadow-soft transition p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium text-ink-900 dark:text-ink-100">{i.title}</p>
                        <p className="text-sm text-ink-600 dark:text-ink-400 mt-1 leading-relaxed">{i.description}</p>
                        {i.rationale && (
                          <p className="text-xs text-ink-500 dark:text-ink-400 mt-1.5"><span className="font-semibold">Why:</span> {i.rationale}</p>
                        )}
                      </div>
                      <div className="shrink-0 flex flex-col items-end gap-1 text-xs text-ink-500 dark:text-ink-400">
                        {i.owner && <span><span className="text-ink-400 dark:text-ink-500">Owner:</span> <span className="text-ink-700 dark:text-ink-300">{i.owner}</span></span>}
                        <span>Effort: <span className="text-ink-700 dark:text-ink-300">{i.effort}</span></span>
                        <span>Impact: <span className="text-ink-700 dark:text-ink-300">{i.impact}</span></span>
                        <span>Horizon: <span className="text-ink-700 dark:text-ink-300">{i.horizon}</span></span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )
        )}
      </div>
    </Card>
  );
}

export function SourcesList({ sources }: { sources: Source[] }) {
  return (
    <Card padded={false}>
      <div className="p-5 border-b border-ink-100 dark:border-ink-700">
        <h3 className="font-semibold text-ink-900 dark:text-ink-100">All sources</h3>
        <p className="text-xs text-ink-500 dark:text-ink-400 mt-1">Every claim in this analysis links back to one of the items below.</p>
      </div>
      <ul className="divide-y divide-ink-100 dark:divide-ink-700">
        {sources.map((s) => (
          <li key={s.id} className="p-4 hover:bg-ink-50/30 dark:hover:bg-ink-700/30">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium text-ink-900 dark:text-ink-100 truncate">{s.title}</p>
                <p className="text-xs text-ink-500 dark:text-ink-400 mt-0.5">{s.publisher} · {s.date}</p>
                {s.snippet && <p className="text-sm text-ink-600 dark:text-ink-400 mt-2">{s.snippet}</p>}
              </div>
              {s.url && (
                <a href={s.url} target="_blank" rel="noreferrer" className="text-ink-500 hover:text-ink-900 dark:hover:text-ink-200 shrink-0">
                  <Icon.External />
                </a>
              )}
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
