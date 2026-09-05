import { type ReactNode } from 'react';

export function Card({
  className = '',
  children,
  padded = true,
}: {
  className?: string;
  children: ReactNode;
  padded?: boolean;
}) {
  return (
    <div className={`card bg-white dark:bg-ink-800 border border-ink-100 dark:border-ink-700 rounded-2xl ${padded ? 'p-5' : ''} ${className}`}>{children}</div>
  );
}

export function Badge({
  children,
  tone = 'neutral',
}: {
  children: ReactNode;
  tone?: 'neutral' | 'green' | 'red' | 'amber' | 'blue' | 'violet' | 'gray';
}) {
  const tones: Record<string, string> = {
    neutral: 'bg-ink-100 dark:bg-ink-700 text-ink-700 dark:text-ink-300',
    green: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800',
    red: 'bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border border-rose-100 dark:border-rose-800',
    amber: 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-800',
    blue: 'bg-sky-50 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400 border border-sky-100 dark:border-sky-800',
    violet: 'bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 border border-violet-100 dark:border-violet-800',
    gray: 'bg-ink-50 dark:bg-ink-700 text-ink-500 dark:text-ink-400 border border-ink-100 dark:border-ink-600',
  };
  return <span className={`pill inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}>{children}</span>;
}
