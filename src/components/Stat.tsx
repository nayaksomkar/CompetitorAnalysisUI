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
      ? 'text-emerald-700 dark:text-emerald-400'
      : accent === 'red'
      ? 'text-rose-700 dark:text-rose-400'
      : 'text-ink-900 dark:text-ink-100';
  return (
    <div className="rounded-xl border border-ink-100 dark:border-ink-700 p-3 bg-white dark:bg-ink-800">
      <p className="text-xs font-medium text-ink-500 dark:text-ink-400 truncate">{label}</p>
      <p className={`text-xl font-semibold mt-0.5 ${color}`}>{value}</p>
    </div>
  );
}
