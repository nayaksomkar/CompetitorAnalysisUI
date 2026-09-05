import { useState } from 'react';
import { Badge, Card } from './primitives';
import { Icon } from './icons';
import type { Competitor } from '../types';

export function CompetitorCard({
  competitor,
  expanded = false,
  onExplain,
  explainButton,
}: {
  competitor: Competitor;
  expanded?: boolean;
  onExplain?: (c: Competitor) => void;
  explainButton?: React.ReactNode;
}) {
  const [open, setOpen] = useState(expanded);

  return (
    <Card padded={false} className="overflow-hidden">
      <div className="p-5">
        <div className="flex items-start gap-3">
          <div className={`h-10 w-10 rounded-xl ${competitor.logoColor} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
            {competitor.name.slice(0, 2)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-ink-900 dark:text-ink-100">{competitor.name}</h3>
              <Badge tone={competitor.marketPosition === 'Leader' ? 'red' : competitor.marketPosition === 'Challenger' ? 'violet' : competitor.marketPosition === 'Niche' ? 'green' : 'amber'}>
                {competitor.marketPosition}
              </Badge>
              <Badge tone="gray">{competitor.pricingTier}</Badge>
            </div>
            <p className="text-sm text-ink-600 dark:text-ink-400 mt-1.5 leading-relaxed">{competitor.description}</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <Stat label="Share" value={`${competitor.marketShare}%`} />
          <Stat label="YoY growth" value={`${competitor.growthRate ?? 0}%`} accent={(competitor.growthRate ?? 0) > 30 ? 'green' : 'neutral'} />
          <Stat label="Funding" value={competitor.funding ?? '—'} />
          <Stat label="Founded" value={competitor.founded ?? '—'} />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-emerald-50/50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 p-3">
            <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-1.5">Strengths</p>
            <ul className="space-y-1">
              {competitor.strengths.slice(0, 3).map((s) => (
                <li key={s} className="text-xs text-ink-700 dark:text-ink-300 flex items-start gap-1.5">
                  <Icon.Check className="w-3.5 h-3.5 mt-0.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg bg-rose-50/50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800 p-3">
            <p className="text-xs font-semibold text-rose-700 dark:text-rose-400 mb-1.5">Weaknesses</p>
            <ul className="space-y-1">
              {competitor.weaknesses.slice(0, 3).map((s) => (
                <li key={s} className="text-xs text-ink-700 dark:text-ink-300 flex items-start gap-1.5">
                  <Icon.Alert className="w-3.5 h-3.5 mt-0.5 text-rose-600 dark:text-rose-400 shrink-0" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-ink-100 dark:border-ink-700 px-5 py-2.5 bg-ink-50/30 dark:bg-ink-800/50">
        <button
          onClick={() => setOpen((v) => !v)}
          className="text-xs text-ink-700 dark:text-ink-300 hover:text-ink-900 dark:hover:text-ink-100 inline-flex items-center gap-1"
        >
          {open ? 'Hide' : 'Show'} SWOT
          <Icon.ChevronDown className={`w-3.5 h-3.5 transition ${open ? 'rotate-180' : ''}`} />
        </button>
        {explainButton ?? (
          <button onClick={() => onExplain?.(competitor)} className="text-xs text-ink-500 dark:text-ink-400 hover:text-ink-900 dark:hover:text-ink-200 inline-flex items-center gap-1">
            <Icon.Help className="w-3.5 h-3.5" />
            Explain this
          </button>
        )}
      </div>

      {open && (
        <div className="border-t border-ink-100 dark:border-ink-700 p-5 bg-white dark:bg-ink-800">
          <SwotGrid swot={competitor.swot} />
        </div>
      )}
    </Card>
  );
}

function Stat({ label, value, accent = 'neutral' }: { label: string; value: string; accent?: 'green' | 'red' | 'neutral' }) {
  const color = accent === 'green' ? 'text-emerald-700 dark:text-emerald-400' : accent === 'red' ? 'text-rose-700 dark:text-rose-400' : 'text-ink-900 dark:text-ink-100';
  return (
    <div className="rounded-lg bg-ink-50/60 dark:bg-ink-700/50 p-2.5">
      <p className="text-[11px] uppercase tracking-wide text-ink-500 dark:text-ink-400 font-medium">{label}</p>
      <p className={`text-sm font-semibold mt-0.5 ${color}`}>{value}</p>
    </div>
  );
}

export function SwotGrid({ swot }: { swot: Competitor['swot'] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <SwotPanel label="Strengths" tone="emerald" items={swot.strengths} />
      <SwotPanel label="Weaknesses" tone="rose" items={swot.weaknesses} />
      <SwotPanel label="Opportunities" tone="sky" items={swot.opportunities} />
      <SwotPanel label="Threats" tone="amber" items={swot.threats} />
    </div>
  );
}

function SwotPanel({ label, tone, items }: { label: string; tone: 'emerald' | 'rose' | 'sky' | 'amber'; items: string[] }) {
  const styles: Record<string, string> = {
    emerald: 'bg-emerald-50/60 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800',
    rose: 'bg-rose-50/60 dark:bg-rose-900/20 border-rose-100 dark:border-rose-800',
    sky: 'bg-sky-50/60 dark:bg-sky-900/20 border-sky-100 dark:border-sky-800',
    amber: 'bg-amber-50/60 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800',
  };
  const labelStyles: Record<string, string> = {
    emerald: 'text-emerald-700 dark:text-emerald-400',
    rose: 'text-rose-700 dark:text-rose-400',
    sky: 'text-sky-700 dark:text-sky-400',
    amber: 'text-amber-700 dark:text-amber-400',
  };
  return (
    <div className={`rounded-xl border p-3 ${styles[tone]}`}>
      <p className={`text-xs font-semibold mb-2 ${labelStyles[tone]}`}>{label}</p>
      <ul className="space-y-1">
        {items.map((i) => (
          <li key={i} className="text-xs text-ink-700 dark:text-ink-300 flex items-start gap-1.5">
            <span className="mt-1 h-1 w-1 rounded-full bg-ink-400 dark:bg-ink-500 shrink-0" />
            <span>{i}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
