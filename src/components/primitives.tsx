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
    <div className={`card ${padded ? 'p-5' : ''} ${className}`}>{children}</div>
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
    neutral: 'bg-ink-100 text-ink-700',
    green: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
    red: 'bg-rose-50 text-rose-700 border border-rose-100',
    amber: 'bg-amber-50 text-amber-700 border border-amber-100',
    blue: 'bg-sky-50 text-sky-700 border border-sky-100',
    violet: 'bg-violet-50 text-violet-700 border border-violet-100',
    gray: 'bg-ink-50 text-ink-500 border border-ink-100',
  };
  return <span className={`pill ${tones[tone]}`}>{children}</span>;
}