import { useEffect, useState } from 'react';

interface ServiceStatus {
  id: string;
  name: string;
  description: string;
  healthUrl: string;
  status: 'checking' | 'online' | 'offline';
  latency?: number;
}

const SERVICES: Omit<ServiceStatus, 'status' | 'latency'>[] = [
  {
    id: 'competitor',
    name: 'Competitor Engine',
    description: 'Scripts & data scraping',
    healthUrl: 'https://competitorengine.onrender.com/health',
  },
  {
    id: 'llmping',
    name: 'LLM Ping',
    description: 'AI brain',
    healthUrl: 'https://llmping.onrender.com/health',
  },
  {
    id: 'webhunter',
    name: 'Web Hunter',
    description: 'Web fetch & search',
    healthUrl: 'https://webhunter.onrender.com/health',
  },
];

async function checkService(url: string): Promise<{ online: boolean; latency: number }> {
  const start = Date.now();
  try {
    const res = await fetch(url, { method: 'GET', signal: AbortSignal.timeout(8000) });
    const latency = Date.now() - start;
    return { online: res.ok, latency };
  } catch {
    return { online: false, latency: Date.now() - start };
  }
}

export function ServerStatus() {
  const [services, setServices] = useState<ServiceStatus[]>(
    SERVICES.map((s) => ({ ...s, status: 'checking' as const }))
  );
  const [expanded, setExpanded] = useState(false);

  const checkAll = async () => {
    setServices((prev) => prev.map((s) => ({ ...s, status: 'checking' })));
    const results = await Promise.all(
      SERVICES.map(async (svc) => {
        const { online, latency } = await checkService(svc.healthUrl);
        return { ...svc, status: online ? ('online' as const) : ('offline' as const), latency };
      })
    );
    setServices(results);
  };

  useEffect(() => {
    checkAll();
    const interval = setInterval(checkAll, 30000);
    return () => clearInterval(interval);
  }, []);

  const onlineCount = services.filter((s) => s.status === 'online').length;
  const allOnline = services.every((s) => s.status === 'online');

  return (
    <div className="rounded-xl border border-ink-100 dark:border-ink-700 bg-white dark:bg-ink-800 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-3 py-2 flex items-center justify-between gap-2 hover:bg-ink-50 dark:hover:bg-ink-700/50 transition-colors"
      >
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={`h-2 w-2 rounded-full shrink-0 ${
              services.some((s) => s.status === 'checking')
                ? 'bg-amber-400 animate-pulse'
                : allOnline
                ? 'bg-emerald-500'
                : onlineCount > 0
                ? 'bg-amber-500'
                : 'bg-rose-500'
            }`}
          />
          <span className="text-xs font-medium text-ink-700 dark:text-ink-300">
            {services.some((s) => s.status === 'checking')
              ? 'Checking…'
              : allOnline
              ? `${onlineCount}/${services.length} live`
              : onlineCount > 0
              ? `${onlineCount}/${services.length} online`
              : 'All offline'}
          </span>
        </div>
        <svg
          className={`w-3 h-3 text-ink-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
          viewBox="0 0 12 12"
          fill="none"
        >
          <path d="M3 5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {expanded && (
        <ul className="border-t border-ink-100 dark:border-ink-700 px-3 py-2 space-y-1.5">
          {services.map((s) => (
            <li key={s.id} className="flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                    s.status === 'checking'
                      ? 'bg-amber-400 animate-pulse'
                      : s.status === 'online'
                      ? 'bg-emerald-500'
                      : 'bg-rose-500'
                  }`}
                />
                <span className="text-ink-700 dark:text-ink-300 truncate">{s.name}</span>
              </div>
              <span
                className={`shrink-0 ${
                  s.status === 'online'
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : s.status === 'offline'
                    ? 'text-rose-600 dark:text-rose-400'
                    : 'text-ink-400'
                }`}
              >
                {s.status === 'checking' ? '…' : s.status === 'online' ? `live · ${s.latency}ms` : 'off'}
              </span>
            </li>
          ))}
          <li className="pt-1.5 mt-1.5 border-t border-ink-100 dark:border-ink-700">
            <button
              onClick={(e) => {
                e.stopPropagation();
                checkAll();
              }}
              className="text-xs text-ink-500 dark:text-ink-400 hover:text-ink-900 dark:hover:text-ink-100"
            >
              ↻ Refresh
            </button>
          </li>
        </ul>
      )}
    </div>
  );
}
