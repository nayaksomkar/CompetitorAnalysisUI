import { useEffect, useState } from 'react';
import { Modal } from './Modal';
import { Icon } from './icons';
import type { Explanation } from '../types';
import { Badge } from './primitives';

export function ExplainButton({
  explanation,
  label = 'Explain this',
}: {
  explanation: Explanation;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-500 dark:text-ink-400 hover:text-ink-900 dark:hover:text-ink-200 rounded-md px-2 py-1 hover:bg-ink-50 dark:hover:bg-ink-700 transition"
      >
        <Icon.Help className="w-3.5 h-3.5" />
        {label}
      </button>
      <ExplainModal explanation={explanation} open={open} onClose={() => setOpen(false)} />
    </>
  );
}

export function ExplainModal({
  explanation,
  open,
  onClose,
}: {
  explanation: Explanation;
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Why this matters"
      subtitle="A grounded explanation with sources"
    >
      <div className="p-6 space-y-5">
        <p className="text-sm text-ink-700 dark:text-ink-300 leading-relaxed">{explanation.summary}</p>

        <div>
          <h3 className="text-sm font-semibold text-ink-900 dark:text-ink-100 mb-2">Why it matters</h3>
          <ul className="space-y-1.5">
            {explanation.whyItMatters.map((w, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-ink-700 dark:text-ink-300">
                <Icon.Sparkles className="w-4 h-4 mt-0.5 text-ink-500 dark:text-ink-400 shrink-0" />
                <span>{w}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-ink-900 dark:text-ink-100 mb-2">Evidence</h3>
          <div className="space-y-2">
            {explanation.evidence.map((e, i) => (
              <div key={i} className="flex items-start gap-3 rounded-lg border border-ink-100 dark:border-ink-700 p-3 bg-ink-50/40 dark:bg-ink-800/50">
                <Badge tone="gray">{e.label}</Badge>
                <p className="text-sm text-ink-700 dark:text-ink-300">{e.detail}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-ink-900 dark:text-ink-100 mb-2">Sources</h3>
          <ul className="space-y-1.5">
            {explanation.sources.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-3 rounded-lg border border-ink-100 dark:border-ink-700 px-3 py-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink-900 dark:text-ink-100 truncate">{s.title}</p>
                  <p className="text-xs text-ink-500 dark:text-ink-400 truncate">{s.publisher} · {s.date}</p>
                </div>
                {s.url && (
                  <a href={s.url} target="_blank" rel="noreferrer" className="text-ink-500 hover:text-ink-900 dark:hover:text-ink-200">
                    <Icon.External />
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Modal>
  );
}

export function useExplainStream() {
  const [_, setTick] = useState(0);
  useEffect(() => {}, []);
  return { refresh: () => setTick((t) => t + 1) };
}
