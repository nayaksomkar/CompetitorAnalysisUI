import { ACTION_REGISTRY, type ContextualAction } from '../actions';
import type { OrchestratorResponse } from '../types';
import { Icon } from './icons';

export function ActionResultView({
  result,
  action,
  onDismiss,
}: {
  result: OrchestratorResponse;
  action: ContextualAction;
  onDismiss: () => void;
}) {
  const heading = action.target
    ? `${ACTION_REGISTRY[action.action].label} ${action.target}`
    : ACTION_REGISTRY[action.action].label;
  const answer = result.answer;
  const competitors = [...(answer?.competitors ?? []), ...(answer?.comparedTo ?? [])];
  const hasDetails = Boolean(
    answer?.summary
    || answer?.explanation
    || answer?.evidence?.length
    || answer?.sources?.length
    || competitors.length
    || result.data,
  );

  return (
    <section aria-live="polite" className="max-h-72 shrink-0 overflow-y-auto border-b border-emerald-100 bg-emerald-50/50 px-4 py-3 sm:px-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">{heading}</p>
          <p className="mt-0.5 text-xs text-ink-500">Selected context: {action.entity} · {action.section}</p>
        </div>
        <button onClick={onDismiss} className="rounded-md p-1 text-ink-500 hover:bg-white" aria-label="Dismiss action result">
          <Icon.X className="h-4 w-4" />
        </button>
      </div>

      {answer?.summary && <p className="mt-2 text-sm leading-relaxed text-ink-800">{answer.summary}</p>}
      {answer?.explanation && <p className="mt-2 text-sm leading-relaxed text-ink-700">{answer.explanation}</p>}

      {answer?.evidence?.length ? (
        <ul className="mt-2 space-y-1">
          {answer.evidence.map((item, index) => (
            <li key={`${item.label}-${index}`} className="text-xs text-ink-700">
              <span className="font-semibold">{item.label}: </span>{item.detail}
            </li>
          ))}
        </ul>
      ) : null}

      {competitors.map((competitor) => (
        <div key={`${competitor.source}-${competitor.id}`} className="mt-2 rounded-lg border border-emerald-100 bg-white p-3">
          <p className="text-sm font-semibold text-ink-900">{competitor.name}</p>
          <p className="mt-1 text-xs leading-relaxed text-ink-700">{competitor.profile.description}</p>
          {competitor.sources.length > 0 && (
            <ul className="mt-2 space-y-1">
              {competitor.sources.map((source) => (
                <li key={source.id} className="text-xs">
                  {source.url
                    ? <a className="text-emerald-700 hover:underline" href={source.url} target="_blank" rel="noreferrer">{source.title}</a>
                    : <span className="text-ink-600">{source.title}</span>}
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}

      {answer?.sources?.length ? (
        <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
          {answer.sources.map((source) => (
            <li key={source.id} className="text-xs">
              {source.url
                ? <a className="text-emerald-700 hover:underline" href={source.url} target="_blank" rel="noreferrer">{source.title}</a>
                : <span className="text-ink-600">{source.title}</span>}
            </li>
          ))}
        </ul>
      ) : null}

      {result.data && (
        <details className="mt-2" open>
          <summary className="cursor-pointer text-xs font-medium text-ink-600">View returned analysis data</summary>
          <pre className="mt-2 max-h-40 overflow-auto rounded-lg bg-white p-3 text-[11px] text-ink-700">{JSON.stringify(result.data, null, 2)}</pre>
        </details>
      )}

      {!hasDetails && (
        <p className="mt-2 text-sm text-ink-600">The orchestrator completed this action without returning displayable data.</p>
      )}
    </section>
  );
}
