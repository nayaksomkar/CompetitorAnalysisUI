import { useMemo, useState } from 'react';
import { Card, Badge } from './primitives';
import { Icon } from './icons';
import type { Product } from '../types';

export function ProductBreakdown({ product }: { product: Product }) {
  type Maturity = Product['features'][number]['maturity'];
  const [filter, setFilter] = useState<'All' | Maturity>('All');
  const [sortBy, setSortBy] = useState<'adoption' | 'name'>('adoption');

  const features = useMemo(() => {
    let f = product.features;
    if (filter !== 'All') f = f.filter((x) => x.maturity === filter);
    f = [...f].sort((a, b) => sortBy === 'adoption' ? (b.adoption ?? 0) - (a.adoption ?? 0) : a.name.localeCompare(b.name));
    return f;
  }, [product.features, filter, sortBy]);

  const maturities: Array<'All' | Maturity> = ['All', 'GA', 'Beta', 'Roadmap', 'Deprecated'];

  return (
    <Card padded={false} className="overflow-hidden">
      <div className="p-5 border-b border-ink-100 dark:border-ink-700">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-ink-900 dark:text-ink-100">{product.name}</h3>
              <Badge tone="blue">{product.category}</Badge>
              <Badge tone="gray">{product.pricingModel}</Badge>
            </div>
            <p className="text-sm text-ink-600 dark:text-ink-400 mt-1">{product.tagline}</p>
            <p className="text-xs text-ink-500 dark:text-ink-400 mt-1">From <span className="font-semibold text-ink-900 dark:text-ink-100">₹{product.startingPrice?.toLocaleString('en-IN')}</span></p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 px-5 py-3 border-b border-ink-100 dark:border-ink-700 bg-ink-50/30 dark:bg-ink-800/50 flex-wrap">
        <div className="inline-flex items-center gap-1 text-xs">
          <Icon.Filter className="w-3.5 h-3.5 text-ink-500 dark:text-ink-400" />
          <span className="text-ink-500 dark:text-ink-400">Filter:</span>
          {maturities.map((m) => (
            <button
              key={m}
              onClick={() => setFilter(m)}
              className={`pill border ${filter === m ? 'bg-ink-900 dark:bg-ink-100 text-white dark:text-ink-900 border-ink-900 dark:border-ink-100' : 'bg-white dark:bg-ink-800 text-ink-700 dark:text-ink-300 border-ink-200 dark:border-ink-600 hover:border-ink-300 dark:hover:border-ink-500'}`}
            >{m}</button>
          ))}
        </div>
        <div className="ml-auto inline-flex items-center gap-1 text-xs">
          <span className="text-ink-500 dark:text-ink-400">Sort:</span>
          <button
            onClick={() => setSortBy('adoption')}
            className={`pill border ${sortBy === 'adoption' ? 'bg-ink-900 dark:bg-ink-100 text-white dark:text-ink-900 border-ink-900 dark:border-ink-100' : 'bg-white dark:bg-ink-800 text-ink-700 dark:text-ink-300 border-ink-200 dark:border-ink-600 hover:border-ink-300 dark:hover:border-ink-500'}`}
          >Adoption</button>
          <button
            onClick={() => setSortBy('name')}
            className={`pill border ${sortBy === 'name' ? 'bg-ink-900 dark:bg-ink-100 text-white dark:text-ink-900 border-ink-900 dark:border-ink-100' : 'bg-white dark:bg-ink-800 text-ink-700 dark:text-ink-300 border-ink-200 dark:border-ink-600 hover:border-ink-300 dark:hover:border-ink-500'}`}
          >Name</button>
        </div>
      </div>

      <ul className="divide-y divide-ink-100 dark:divide-ink-700">
        {features.map((f) => (
          <li key={f.id} className="p-4 hover:bg-ink-50/30 dark:hover:bg-ink-700/30 transition">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium text-ink-900 dark:text-ink-100">{f.name}</p>
                  <MaturityBadge maturity={f.maturity} />
                </div>
                <p className="text-sm text-ink-600 dark:text-ink-400 mt-0.5">{f.description}</p>
              </div>
              <div className="w-40 shrink-0">
                <div className="flex items-center justify-between text-xs text-ink-500 dark:text-ink-400 mb-1">
                  <span>Adoption</span>
                  <span className="font-semibold text-ink-900 dark:text-ink-100">{f.adoption}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-ink-100 dark:bg-ink-600 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all"
                    style={{ width: `${f.adoption}%` }}
                  />
                </div>
              </div>
            </div>
          </li>
        ))}
        {features.length === 0 && (
          <li className="p-6 text-center text-sm text-ink-500 dark:text-ink-400">No features match.</li>
        )}
      </ul>
    </Card>
  );
}

function MaturityBadge({ maturity }: { maturity: Product['features'][number]['maturity'] }) {
  const map: Record<NonNullable<Product['features'][number]['maturity']>, { tone: 'green' | 'amber' | 'red' | 'blue' | 'gray'; label: string }> = {
    GA: { tone: 'green', label: 'GA' },
    Beta: { tone: 'amber', label: 'Beta' },
    Roadmap: { tone: 'blue', label: 'Roadmap' },
    Deprecated: { tone: 'gray', label: 'Deprecated' },
  };
  const m = maturity ?? 'GA';
  const { tone, label } = map[m];
  return <Badge tone={tone}>{label}</Badge>;
}
