/**
 * Renders a concise, honest placeholder for a section whose data is missing.
 *
 * The orchestrator returns `status: 'partial'` (or omits a field) when research
 * could not fill it. The UI should NOT invent zeros, empty competitors, or
 * generic "no data" banners for every section. Each placeholder explains
 * precisely what is unavailable so the user can tell "not researched" apart
 * from "researched and absent".
 */
export function SectionPlaceholder({
  title,
  message,
  tone = 'neutral',
}: {
  title: string;
  message: string;
  tone?: 'neutral' | 'amber' | 'rose';
}) {
  const toneClass = tone === 'amber'
    ? 'border-amber-200 bg-amber-50/50 text-amber-800'
    : tone === 'rose'
      ? 'border-rose-200 bg-rose-50/50 text-rose-800'
      : 'border-ink-200 bg-ink-50/40 text-ink-600';
  return (
    <div className={`rounded-xl border p-4 text-sm ${toneClass}`}>
      <p className="font-medium">{title}</p>
      <p className="mt-1 text-xs leading-relaxed opacity-80">{message}</p>
    </div>
  );
}

export function CompetitorsPlaceholder() {
  return (
    <SectionPlaceholder
      title="No competitor records are available yet."
      message="The analysis did not return structured competitor profiles. Treat any narrative claims about competitors as unverified."
    />
  );
}

export function PricingPlaceholder() {
  return (
    <SectionPlaceholder
      title="Competitor pricing has not been verified yet."
      message="No verified pricing tiers were returned. Do not assume the figures you see elsewhere on this page."
      tone="amber"
    />
  );
}

export function MarketGapsPlaceholder() {
  return (
    <SectionPlaceholder
      title="No evidence-backed market gaps are available yet."
      message="The orchestrator did not return market-gap records for this analysis."
    />
  );
}

export function SourcesPlaceholder() {
  return (
    <SectionPlaceholder
      title="No supporting sources were returned."
      message="Treat all research claims and metrics on this page as unverified until sources are available."
      tone="amber"
    />
  );
}

export function ProductsPlaceholder() {
  return (
    <SectionPlaceholder
      title="No product records are available yet."
      message="The analysis did not return structured product or feature data."
    />
  );
}

export function InsightsPlaceholder() {
  return (
    <SectionPlaceholder
      title="No insights or recommendations are available yet."
      message="The orchestrator did not return structured insight records for this analysis."
    />
  );
}

export function ReportsPlaceholder() {
  return (
    <SectionPlaceholder
      title="No reports or action plans are available yet."
      message="The orchestrator did not return structured report or action-plan records."
    />
  );
}