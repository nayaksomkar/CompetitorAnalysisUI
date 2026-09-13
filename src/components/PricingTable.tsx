import { useMemo, useState } from 'react';
import { Card, Badge } from './primitives';
import { Icon } from './icons';
import type { PricingTier } from '../types';

export function PricingTable({
  title,
  tiers,
}: {
  title: string;
  tiers: PricingTier[];
}) {
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
  if (!query.trim()) return tiers;
  const q = query.toLowerCase();
  return tiers.filter((t) => t.name.toLowerCase().includes(q) || t.features.some((f) => f.toLowerCase().includes(q)));
  }, [tiers, query]);

  return (
  <Card padded={false} className="overflow-hidden">
  <div className="flex items-center justify-between gap-3 p-4 border-b border-ink-100  flex-wrap">
  <div className="flex items-center gap-3">
  <h3 className="font-semibold text-ink-900 ">{title}</h3>
  <div className="inline-flex rounded-lg border border-ink-200  p-0.5 text-xs">
  <button
  onClick={() => setBilling('monthly')}
  className={`px-2.5 py-1 rounded-md ${billing === 'monthly' ? 'bg-ink-900  text-white ' : 'text-ink-700 '}`}
  >Monthly</button>
  <button
  onClick={() => setBilling('yearly')}
  className={`px-2.5 py-1 rounded-md ${billing === 'yearly' ? 'bg-ink-900  text-white ' : 'text-ink-700 '}`}
  >Yearly</button>
  </div>
  </div>
  <div className="relative">
  <Icon.Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-ink-400 " />
  <input
  value={query}
  onChange={(e) => setQuery(e.target.value)}
  placeholder="Filter tiers…"
  className="text-sm rounded-lg border border-ink-200  bg-white  text-ink-900  pl-8 pr-3 py-1.5 outline-none focus:border-ink-400 placeholder:text-ink-400"
  />
  </div>
  </div>
  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 bg-ink-50/20 ">
  {filtered.map((t) => (
  <PricingCard key={t.id} tier={t} billing={billing} />
  ))}
  {filtered.length === 0 && (
  <div className="md:col-span-3 text-center text-sm text-ink-500  py-6">No tiers match.</div>
  )}
  </div>
  </Card>
  );
}

function PricingCard({ tier, billing }: { tier: PricingTier; billing: 'monthly' | 'yearly' }) {
  const price = tier.priceMonthly === 'Custom' ? 'Custom' : `₹${tier.priceMonthly.toLocaleString('en-IN')}`;
  const cycle = tier.priceMonthly === 'Custom' ? '' : billing === 'yearly' ? '/mo · billed yearly' : '/mo';

  return (
  <div
  className={`relative rounded-2xl border p-5 bg-white  transition hover:shadow-soft ${tier.highlighted ? 'border-ink-900  ring-1 ring-ink-900 ' : 'border-ink-200 '}`}
  title={`Best for: ${tier.bestFor}`}
  >
  {tier.highlighted && (
  <span className="absolute -top-2 left-4 pill bg-ink-900  text-white ">Most popular</span>
  )}
  <div className="flex items-center justify-between">
  <p className="font-semibold text-ink-900 ">{tier.name}</p>
  <Badge tone="gray">{tier.pricingModel ?? tier.billing}</Badge>
  </div>
  <p className="text-xs text-ink-500  mt-1">{tier.bestFor}</p>
  <div className="mt-4 flex items-baseline gap-1">
  <span className="text-3xl font-bold text-ink-900 ">{price}</span>
  <span className="text-xs text-ink-500 ">{cycle}</span>
  </div>
  <ul className="mt-4 space-y-1.5">
  {tier.features.map((f) => (
  <li key={f} className="text-sm text-ink-700  flex items-start gap-2">
  <Icon.Check className="w-4 h-4 mt-0.5 text-emerald-600  shrink-0" />
  <span>{f}</span>
  </li>
  ))}
  </ul>
  </div>
  );
}
