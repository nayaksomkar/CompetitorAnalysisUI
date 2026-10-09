import { createContext, useContext, useState, type ReactNode } from 'react';
import { Icon } from './icons';
import type { Explanation } from '../types';

type ExplainSection = 'competitor' | 'pricing' | 'market-gap' | 'insight' | 'chart' | 'product' | 'report' | 'sources';

interface ExplainContext {
  section: ExplainSection;
  title: string;
  entity: string;
  explanation?: Explanation;
}

interface ExplainPanelApi {
  openExplain: (context: ExplainContext) => void;
}

const ExplainPanelContext = createContext<ExplainPanelApi | null>(null);

export function ExplainPanelProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [context, setContext] = useState<ExplainContext | null>(null);
  const openContext = (value: ExplainContext) => {
    setContext(value);
  };
  const closePanel = () => {
    setContext(null);
  };

  return (
    <ExplainPanelContext.Provider value={{ openExplain: openContext }}>
      {children}
      {context && (
        <>
          <button
            aria-label="Close explanation panel"
            className="fixed inset-0 z-40 cursor-default bg-black/20"
            onClick={closePanel}
          />
          <aside
            role="dialog"
            aria-modal="true"
            aria-label={`Explain ${context.title}`}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-ink-200 bg-white shadow-2xl"
          >
            <header className="flex items-start justify-between gap-3 border-b border-ink-100 px-5 py-4">
              <div>
                <h2 className="text-base font-semibold text-ink-900">Explain this</h2>
                <p className="mt-1 text-sm text-ink-500">{context.title}</p>
              </div>
              <button
                onClick={closePanel}
                className="rounded-lg p-1.5 text-ink-500 hover:bg-ink-50 hover:text-ink-900"
                aria-label="Close"
              >
                <Icon.X />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto p-5">
              <div className="mb-6">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">{context.entity}</p>
                {context.explanation?.summary ? (
                  <p className="mt-3 text-sm leading-relaxed text-ink-700">{context.explanation.summary}</p>
                ) : (
                  <p className="mt-3 text-sm text-ink-500">No explanation is available for this section.</p>
                )}
                {context.explanation?.whyItMatters?.length ? (
                  <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-ink-600">
                    {context.explanation.whyItMatters.map((item, index) => <li key={`${index}-${item}`}>{item}</li>)}
                  </ul>
                ) : null}
              </div>

              {context.explanation?.sources?.length ? (
                <section className="mb-6 border-t border-ink-100 pt-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-500">Sources</h3>
                  <ul className="mt-2 space-y-2">
                    {context.explanation.sources.map((source) => (
                      <li key={source.id} className="text-sm">
                        {source.url ? (
                          <a className="text-emerald-700 hover:underline" href={source.url} target="_blank" rel="noreferrer">
                            {source.title}
                          </a>
                        ) : <span className="text-ink-700">{source.title}</span>}
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}

            </div>
          </aside>
        </>
      )}
    </ExplainPanelContext.Provider>
  );
}

export function ExplainButton({
  explanation,
  context,
  label = 'Explain this',
}: {
  explanation?: ExplainContext['explanation'];
  context: Omit<ExplainContext, 'explanation'>;
  label?: string;
}) {
  const panel = useContext(ExplainPanelContext);
  if (!panel) return null;

  return (
    <button
      onClick={() => panel.openExplain({ ...context, explanation })}
      className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-ink-500 transition hover:bg-ink-50 hover:text-ink-900"
    >
      <Icon.Help className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}
