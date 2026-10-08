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
  const explanation = result.explanation ?? answer?.explanation;
  const competitors = [...(answer?.competitors ?? []), ...(answer?.comparedTo ?? [])];
  const hasData = Boolean(result.data && Object.keys(result.data).length);
  const hasDetails = Boolean(
    answer?.summary
    || answer?.question
    || explanation
    || answer?.evidence?.length
    || answer?.sources?.length
    || competitors.length
    || hasData
    || result.missing_data?.length
    || result.error,
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
      {answer?.question && <p className="mt-2 text-sm font-medium text-ink-700">{answer.question}</p>}
      {explanation && explanation !== answer?.summary && <p className="mt-2 text-sm leading-relaxed text-ink-700">{explanation}</p>}

      {result.error && (
        <p role="alert" className="mt-2 text-sm text-rose-700">{result.error}</p>
      )}

      {result.missing_data?.length ? (
        <section role="status" className="mt-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          <p className="font-semibold">{result.status === 'partial' ? 'Partial result — some information is missing' : 'Some information is unavailable'}</p>
          <ul className="mt-1 list-disc space-y-0.5 pl-4">
            {result.missing_data.map((item, index) => (
              <li key={`${item.field}-${index}`}>{item.field}: {item.reason}</li>
            ))}
          </ul>
        </section>
      ) : null}

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
              {(source.publisher || source.date || source.snippet) && (
                <p className="mt-0.5 text-ink-500">
                  {[source.publisher, source.date].filter(Boolean).join(' · ')}
                  {source.snippet ? `${source.publisher || source.date ? ' · ' : ''}${source.snippet}` : ''}
                </p>
              )}
            </li>
          ))}
        </ul>
      ) : null}

      {hasData && result.data && (
        <details className="mt-2" open>
          <summary className="cursor-pointer text-xs font-medium text-ink-600">View returned analysis data</summary>
          <pre className="mt-2 max-h-40 overflow-auto rounded-lg bg-white p-3 text-[11px] text-ink-700">{JSON.stringify(result.data, null, 2)}</pre>
        </details>
      )}

      {!hasDetails && (
        <p className="mt-2 text-sm text-ink-600">The action completed, but no displayable data was returned.</p>
      )}
    </section>
  );
}
