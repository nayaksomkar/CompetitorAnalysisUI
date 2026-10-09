const repositories = [
  { name: 'CompetitorAnalysisUI', subtitle: 'Frontend / UI', href: 'https://github.com/nayaksomkar/CompetitorAnalysisUI' },
  { name: 'CompetitorEngine', subtitle: 'Backend / Orchestrator', href: 'https://github.com/nayaksomkar/CompetitorEngine' },
  { name: 'LLMPing', subtitle: 'LLM Inference Service', href: 'https://github.com/nayaksomkar/LLMPing' },
  { name: 'TotemEngine', subtitle: 'Web Scraper / Research Engine', href: 'https://github.com/nayaksomkar/TotemEngine' },
];

function GitHubMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 shrink-0 fill-current">
      <path d="M12 .9a11.1 11.1 0 0 0-3.51 21.63c.56.1.76-.24.76-.54v-2.1c-3.1.67-3.75-1.32-3.75-1.32-.5-1.29-1.24-1.63-1.24-1.63-1.01-.69.08-.68.08-.68 1.12.08 1.71 1.15 1.71 1.15 1 .1.76 2.32 3.99 1.65.1-.72.39-1.22.7-1.5-2.48-.28-5.09-1.24-5.09-5.5 0-1.22.44-2.21 1.15-2.99-.12-.28-.5-1.42.11-2.95 0 0 .94-.3 3.05 1.14a10.6 10.6 0 0 1 5.55 0c2.12-1.44 3.05-1.14 3.05-1.14.61 1.53.23 2.67.11 2.95.72.78 1.15 1.77 1.15 2.99 0 4.27-2.62 5.21-5.11 5.49.4.34.75 1.02.75 2.06v3.06c0 .3.2.65.77.54A11.1 11.1 0 0 0 12 .9Z" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="shrink-0 border-t border-ink-100 bg-[#f7f5f0] px-4 py-3 sm:px-6">
      <div className="mx-auto max-w-6xl rounded-2xl border border-white/80 bg-white/80 p-3 shadow-[0_8px_24px_rgba(37,31,20,0.06)] sm:p-4">
        <nav aria-label="Project repositories" className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {repositories.map((repository) => (
            <a
              key={repository.name}
              href={repository.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${repository.name} repository, ${repository.subtitle} (opens in a new tab)`}
              className="flex min-w-0 items-center gap-3 rounded-xl border border-ink-100 bg-white px-3 py-2.5 text-ink-700 transition hover:border-ink-200 hover:bg-ink-50/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <GitHubMark />
              <span className="min-w-0">
                <span className="block truncate text-xs font-semibold text-ink-900">{repository.name}</span>
                <span className="mt-0.5 block truncate text-[10px] text-ink-500">{repository.subtitle}</span>
              </span>
            </a>
          ))}
        </nav>
        <div className="my-3 border-t border-dashed border-ink-200" />
        <div className="flex flex-col items-start justify-between gap-1.5 text-[10px] text-ink-500 sm:flex-row sm:items-center">
          <p>© 2026 Competitive Insights</p>
          <a
            href="https://nayaksomkar.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Nayak Omkar (@nayaksomkar) portfolio (opens in a new tab)"
            className="font-medium text-ink-600 underline decoration-ink-300 underline-offset-2 hover:text-ink-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            Nayak Omkar <span className="text-ink-400">(@nayaksomkar)</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
