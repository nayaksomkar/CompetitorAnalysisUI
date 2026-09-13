import { useEffect, useState } from 'react';
import { loadEndpointConfig } from './EndpointSettings';

interface ServiceStatus {
  id: string;
  name: string;
  url: string;
  status: 'checking' | 'online' | 'offline';
  latency?: number;
}

async function checkService(url: string): Promise<{ online: boolean; latency: number }> {
  const start = Date.now();
  try {
    const res = await fetch(`${url.replace(/\/+$/, '')}/health`, { method: 'GET', signal: AbortSignal.timeout(8000) });
    const latency = Date.now() - start;
    return { online: res.ok, latency };
  } catch {
    return { online: false, latency: Date.now() - start };
  }
}

export function ServerStatus() {
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [expanded, setExpanded] = useState(false);

  // Build the service list from the active endpoint of each configured service.
  const loadServices = (): ServiceStatus[] => {
    const cfg = loadEndpointConfig();
    return cfg.services.map((svc) => {
      const active = svc.endpoints.find((e) => e.active) ?? svc.endpoints[0];
      return { id: svc.id, name: svc.name, url: active?.url ?? '', status: 'checking' as const };
    });
  };

  const checkAll = async () => {
    setServices((prev) => prev.map((s) => ({ ...s, status: 'checking' })));
    const targets = loadServices();
    const results = await Promise.all(
      targets.map(async (svc) => {
        if (!svc.url) return { ...svc, status: 'offline' as const, latency: 0 };
        const { online, latency } = await checkService(svc.url);
        return { ...svc, status: online ? ('online' as const) : ('offline' as const), latency };
      })
    );
    setServices(results);
  };

  useEffect(() => {
    setServices(loadServices());
    checkAll();
    const interval = setInterval(checkAll, 30000);
    return () => clearInterval(interval);
  }, []);

  const onlineCount = services.filter((s) => s.status === 'online').length;
  const allOnline = services.length > 0 && services.every((s) => s.status === 'online');
  const noneConfigured = services.length === 0;

  return (
    <div className="rounded-xl border border-ink-100 bg-white overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-3 py-2 flex items-center justify-between gap-2 hover:bg-ink-50 transition-colors"
      >
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={`h-2 w-2 rounded-full shrink-0 ${
              noneConfigured
                ? 'bg-ink-300'
                : services.some((s) => s.status === 'checking')
                ? 'bg-amber-400 animate-pulse'
                : allOnline
                ? 'bg-emerald-500'
                : onlineCount > 0
                ? 'bg-amber-500'
                : 'bg-rose-500'
            }`}
          />
          <span className="text-xs font-medium text-ink-700">
            {noneConfigured
              ? 'No endpoints'
              : services.some((s) => s.status === 'checking')
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
        <ul className="border-t border-ink-100 px-3 py-2 space-y-1.5">
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
                <span className="text-ink-700 truncate">{s.name}</span>
              </div>
              <span
                className={`shrink-0 ${
                  s.status === 'online'
                    ? 'text-emerald-600'
                    : s.status === 'offline'
                    ? 'text-rose-600'
                    : 'text-ink-400'
                }`}
              >
                {s.status === 'checking' ? '…' : s.status === 'online' ? `live · ${s.latency}ms` : 'off'}
              </span>
            </li>
          ))}
          {services.length > 0 && (
            <li className="pt-1.5 mt-1.5 border-t border-ink-100">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  checkAll();
                }}
                className="text-xs text-ink-500 hover:text-ink-900"
              >
                ↻ Refresh
              </button>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
