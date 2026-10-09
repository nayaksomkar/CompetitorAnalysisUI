import { Component, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Catches render errors so a single failing component (or a failed API
 * request that throws during render) cannot blank the entire application.
 *
 * The fallback UI is intentionally lightweight and lets the user retry or
 * reload without losing unrelated state.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    // Reset when children change (e.g. after switching profiles).
    if (prevProps.children !== this.props.children && this.state.hasError) {
      this.setState({ hasError: false, error: null });
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-ink-50/30">
          <div className="max-w-md w-full rounded-2xl border border-rose-200 bg-white p-6 shadow-soft text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-rose-50 flex items-center justify-center mb-4">
              <svg className="h-6 w-6 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-3L13.73 4a2 2 0 0 0-3.46 0L3.34 16c-.77 1.33.19 3 1.73 3z" />
              </svg>
            </div>
            <h2 className="text-base font-semibold text-ink-900">Something broke while rendering</h2>
            <p className="mt-1 text-sm text-ink-600">
              {this.state.error?.message ?? 'An unexpected error occurred.'}
            </p>
            <p className="mt-2 text-xs text-ink-400">
              The rest of the page is unaffected. Try reloading or switching back to a saved sample.
            </p>
            <div className="mt-4 flex items-center justify-center gap-2">
              <button
                onClick={() => this.setState({ hasError: false, error: null })}
                className="rounded-lg bg-ink-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-ink-700"
              >
                Dismiss
              </button>
              <button
                onClick={() => window.location.reload()}
                className="rounded-lg border border-ink-200 px-3 py-1.5 text-xs font-medium text-ink-700 hover:bg-ink-50"
              >
                Reload page
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}