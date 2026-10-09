export function ServerStatus() {
  return (
    <div className="rounded-xl border border-ink-100 bg-white px-3 py-2 flex items-center gap-2">
      <span className="h-2 w-2 rounded-full shrink-0 bg-ink-300" aria-hidden="true" />
      <span className="text-xs font-medium text-ink-700">Dynamic analysis unavailable</span>
    </div>
  );
}
