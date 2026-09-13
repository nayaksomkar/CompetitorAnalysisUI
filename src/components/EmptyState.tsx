import type { ReactNode } from 'react';
import { Icon } from './icons';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

/**
 * Reusable empty state placeholder.
 * Shown when a section has no data (from API or JSON).
 */
export function EmptyState({
  title = 'No data available',
  description = 'Data will appear here once the analysis completes.',
  icon,
  action,
}: EmptyStateProps) {
  return (
  <div className="rounded-2xl border border-dashed border-ink-200 p-8 text-center">
  {icon ?? <Icon.BarChart className="w-10 h-10 mx-auto text-ink-300 mb-3" />}
  <p className="text-sm font-medium text-ink-600">{title}</p>
  {description && (
  <p className="text-xs text-ink-400 mt-1 max-w-xs mx-auto">{description}</p>
  )}
  {action && <div className="mt-4">{action}</div>}
  </div>
  );
}

/**
 * Empty state for tab content when no data exists at all.
 */
export function TabEmptyState({ tabName }: { tabName: string }) {
  return (
  <EmptyState
  title={`No ${tabName} data`}
  description={`The analysis did not return any ${tabName.toLowerCase()}. This can happen when the research didn't find relevant data for your business.`}
  />
  );
}
