export function Stat({
  label,
  value,
  accent = 'neutral',
}: {
  label: string;
  value: string | number;
  accent?: 'green' | 'red' | 'neutral';
}) {
  const color =
  accent === 'green'
  ? 'text-emerald-700 '
  : accent === 'red'
  ? 'text-rose-700 '
  : 'text-ink-900 ';
  return (
  <div className="rounded-xl border border-ink-100  p-3 bg-white ">
  <p className="text-xs font-medium text-ink-500  truncate">{label}</p>
  <p className={`text-xl font-semibold mt-0.5 ${color}`}>{value}</p>
  </div>
  );
}
