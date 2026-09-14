import { useEffect, useState } from 'react';
import { Icon } from './icons';
import { Modal } from './Modal';

// =============================================================================
// Multi-endpoint configuration
//
// Each service (competitor engine / llm ping / web hunter) can have any number
// of named endpoints. One endpoint per service is marked `active` — that's the
// one the API clients use. The list is persisted to localStorage so the
// configuration survives reloads.
//
// Storage shape (v2):
//   {
//     version: 2,
//     services: [
//       {
//         id: 'competitor',
//         name: 'Competitor Engine',
//         description: 'Scripts & data scraping',
//         endpoints: [{ id, label, url, active }, ...],
//       },
//       ...
//     ],
//   }
// =============================================================================

export type ServiceId = 'competitor' | 'llmping' | 'webhunter';

export interface Endpoint {
  id: string;
  label: string;
  url: string;
  active?: boolean;
}

export interface ServiceConfig {
  id: ServiceId;
  name: string;
  description: string;
  endpoints: Endpoint[];
}

interface EndpointConfig {
  version: 2 | 3;
  services: ServiceConfig[];
}

const STORAGE_KEY = 'endpoint_config_v3';

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const DEFAULT_CONFIG: EndpointConfig = {
  version: 2,
  services: [
    {
      id: 'competitor',
      name: 'Competitor Engine',
      description: 'Scripts & data scraping',
      endpoints: [
        { id: slug('Competitor Engine · Localhost'), label: 'Competitor Engine · Localhost', url: 'http://localhost:8001' },
        { id: slug('Competitor Engine · Render'), label: 'Competitor Engine · Render', url: 'https://competitorengine.onrender.com', active: true },
      ],
    },
    {
      id: 'llmping',
      name: 'LLM Ping',
      description: 'AI brain',
      endpoints: [
        { id: slug('LLM Ping · Localhost'), label: 'LLM Ping · Localhost', url: 'http://localhost:8000' },
        { id: slug('LLM Ping · Render'), label: 'LLM Ping · Render', url: 'https://llmping.onrender.com', active: true },
      ],
    },
    {
      id: 'webhunter',
      name: 'Web Hunter',
      description: 'Web fetch & search',
      endpoints: [
        { id: slug('Web Hunter · Localhost'), label: 'Web Hunter · Localhost', url: 'http://localhost:8765' },
        { id: slug('Web Hunter · Render'), label: 'Web Hunter · Render', url: 'https://webhunter-1v83.onrender.com', active: true },
      ],
    },
  ],
};

/** Load config from localStorage, migrating from the old shape if needed. */
export function loadEndpointConfig(): EndpointConfig {
  try {
    const stored = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem('endpoint_config_v2') ?? localStorage.getItem('endpoint_config');
    if (stored) {
      const parsed = JSON.parse(stored);
      if ((parsed.version === 2 || parsed.version === 3) && Array.isArray(parsed.services)) return { ...parsed, version: 3 };
      // Migrate from v1 (single localhost/render pairs) if needed.
      if (parsed.localhost || parsed.render) {
        return {
          version: 2,
          services: DEFAULT_CONFIG.services.map((svc) => ({
            ...svc,
            endpoints: [
              { id: slug(`${svc.name} · ${parsed.activeEndpoint === 'localhost' ? 'Localhost' : 'Render'}`), label: `${svc.name} · ${parsed.activeEndpoint === 'localhost' ? 'Localhost' : 'Render'}`, url: parsed.activeEndpoint === 'localhost' ? parsed.localhost : parsed.render, active: true },
              { id: slug(`${svc.name} · ${parsed.activeEndpoint === 'localhost' ? 'Render' : 'Localhost'}`), label: `${svc.name} · ${parsed.activeEndpoint === 'localhost' ? 'Render' : 'Localhost'}`, url: parsed.activeEndpoint === 'localhost' ? parsed.render : parsed.localhost, active: false },
            ],
          })),
        };
      }
    }
  } catch {
    /* ignore */
  }
  return DEFAULT_CONFIG;
}

export function saveEndpointConfig(config: EndpointConfig): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...config, version: 3 }));
  // Clean up the legacy keys
  localStorage.removeItem('endpoint_config');
  localStorage.removeItem('endpoint_config_v2');
}

/** Get the active URL for a given service. */
export function getActiveUrl(serviceId: ServiceId): string {
  const config = loadEndpointConfig();
  const svc = config.services.find((s) => s.id === serviceId);
  const active = svc?.endpoints.find((e) => e.active);
  return active?.url ?? svc?.endpoints[0]?.url ?? '';
}

/**
 * Backward-compat shim — used by api/orchestrator.ts.
 * Returns the active URL for the Competitor Engine service.
 */
export function getActiveBaseUrl(): string {
  return getActiveUrl('competitor');
}

// =============================================================================
// Editor UI
// =============================================================================

interface EndpointSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: EndpointConfig) => void;
}

export function EndpointSettings({ isOpen, onClose, onSave }: EndpointSettingsProps) {
  const [config, setConfig] = useState<EndpointConfig>(loadEndpointConfig);
  const [status, setStatus] = useState<Record<string, 'idle' | 'checking' | 'online' | 'offline'>>({});
  const [editing, setEditing] = useState<{ serviceId: ServiceId; endpointId?: string } | null>(null);

  // Auto-check all endpoints when the modal opens
  useEffect(() => {
    if (!isOpen) return;
    const all = config.services.flatMap((svc) =>
      svc.endpoints.map((ep) => ({ url: ep.url, key: `${svc.id}:${ep.id}` }))
    );
    all.forEach(({ url, key }) => checkHealth(url, key));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const updateService = (serviceId: ServiceId, updater: (svc: ServiceConfig) => ServiceConfig) => {
    setConfig((prev) => ({
      ...prev,
      services: prev.services.map((s) => (s.id === serviceId ? updater(s) : s)),
    }));
  };

  const setActive = (serviceId: ServiceId, endpointId: string) => {
    updateService(serviceId, (svc) => ({
      ...svc,
      endpoints: svc.endpoints.map((e) => ({ ...e, active: e.id === endpointId })),
    }));
  };

  const removeEndpoint = (serviceId: ServiceId, endpointId: string) => {
    updateService(serviceId, (svc) => {
      const endpoints = svc.endpoints.filter((e) => e.id !== endpointId);
      // Ensure at least one active remains
      if (endpoints.length > 0 && !endpoints.some((e) => e.active)) {
        endpoints[0] = { ...endpoints[0], active: true };
      }
      return { ...svc, endpoints };
    });
  };

  const addEndpoint = (serviceId: ServiceId) => {
    const svc = config.services.find((s) => s.id === serviceId);
    if (!svc) return;
    setEditing({ serviceId, endpointId: undefined });
  };

  const editEndpoint = (serviceId: ServiceId, endpointId: string) => {
    setEditing({ serviceId, endpointId });
  };

  const checkHealth = async (url: string, key: string) => {
    setStatus((prev) => ({ ...prev, [key]: 'checking' }));
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(`${url.replace(/\/+$/, '')}/health`, { signal: controller.signal });
      clearTimeout(timeout);
      setStatus((prev) => ({ ...prev, [key]: res.ok ? 'online' : 'offline' }));
    } catch {
      setStatus((prev) => ({ ...prev, [key]: 'offline' }));
    }
  };

  const handleSave = () => {
    saveEndpointConfig(config);
    onSave(config);
    onClose();
  };

  return (
    <Modal open={isOpen} onClose={onClose} title="API Endpoints" subtitle="Configure backend URLs for testing">
      <div className="space-y-4">
        {config.services.map((svc) => (
          <div key={svc.id} className="rounded-xl border border-ink-200 p-4">
            <div className="flex items-start justify-between mb-3 gap-2">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-ink-900">{svc.name}</p>
                <p className="text-xs text-ink-500">{svc.description}</p>
              </div>
              <button
                onClick={() => addEndpoint(svc.id)}
                className="text-xs px-2.5 py-1 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 inline-flex items-center gap-1 shrink-0"
              >
                <Icon.Plus className="w-3 h-3" /> Add
              </button>
            </div>

            <div className="space-y-2">
              {svc.endpoints.length === 0 && (
                <p className="text-xs text-ink-400 italic">No endpoints yet. Click "Add" to create one.</p>
              )}
              {svc.endpoints.map((ep) => {
                const statusKey = `${svc.id}:${ep.id}`;
                const st = status[statusKey] ?? 'idle';
                return (
                  <div
                    key={ep.id}
                    className={`flex items-center gap-2 rounded-lg border p-2 ${
                      ep.active ? 'border-emerald-300 bg-emerald-50/50' : 'border-ink-200 bg-white'
                    }`}
                  >
                    <button
                      onClick={() => setActive(svc.id, ep.id)}
                      className={`h-4 w-4 rounded-full border-2 shrink-0 flex items-center justify-center ${
                        ep.active ? 'border-emerald-500' : 'border-ink-300 hover:border-ink-400'
                      }`}
                      title={ep.active ? 'Active endpoint' : 'Set as active'}
                    >
                      {ep.active && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />}
                    </button>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-medium text-ink-900 truncate">{ep.label}</p>
                        {ep.active && st === 'online' && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500 text-white font-semibold">
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-ink-500 truncate font-mono">{ep.url}</p>
                    </div>
                    <button
                      onClick={() => checkHealth(ep.url, statusKey)}
                      className="text-[11px] px-2 py-1 rounded bg-ink-100 text-ink-600 hover:bg-ink-200 shrink-0"
                      title="Test /health endpoint"
                    >
                      {st === 'checking' ? '...' : 'Test'}
                    </button>
                    {st === 'online' && (
                      <span className="flex items-center gap-1 text-[11px] text-emerald-600 shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> live
                      </span>
                    )}
                    {st === 'offline' && (
                      <span className="flex items-center gap-1 text-[11px] text-rose-600 shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> off
                      </span>
                    )}
                    <button
                      onClick={() => editEndpoint(svc.id, ep.id)}
                      className="p-1 rounded hover:bg-ink-100 text-ink-500 shrink-0"
                      title="Edit"
                    >
                      <Icon.Gear className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => removeEndpoint(svc.id, ep.id)}
                      className="p-1 rounded hover:bg-rose-50 text-ink-400 hover:text-rose-600 shrink-0"
                      title="Remove"
                    >
                      <Icon.X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Endpoint editor */}
        {editing && (
          <EndpointEditor
            service={config.services.find((s) => s.id === editing.serviceId)!}
            endpoint={editing.endpointId ? config.services.find((s) => s.id === editing.serviceId)!.endpoints.find((e) => e.id === editing.endpointId) : undefined}
            onSave={(label, url) => {
              updateService(editing.serviceId, (svc) => {
                if (editing.endpointId) {
                  return {
                    ...svc,
                    endpoints: svc.endpoints.map((e) => (e.id === editing.endpointId ? { ...e, label, url } : e)),
                  };
                }
                const newEp: Endpoint = { id: slug(`${svc.id}-${label}-${Date.now()}`), label, url };
                return { ...svc, endpoints: [...svc.endpoints, newEp] };
              });
              setEditing(null);
            }}
            onCancel={() => setEditing(null)}
          />
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-ink-600 hover:bg-ink-100">
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-lg text-sm bg-emerald-500 text-white hover:bg-emerald-600 font-medium"
          >
            Save & Apply
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ----- Inline editor for add/edit -----

function EndpointEditor({
  service,
  endpoint,
  onSave,
  onCancel,
}: {
  service: ServiceConfig;
  endpoint?: Endpoint;
  onSave: (label: string, url: string) => void;
  onCancel: () => void;
}) {
  const [label, setLabel] = useState(endpoint?.label ?? `${service.name} · Local`);
  const [url, setUrl] = useState(endpoint?.url ?? 'http://localhost:8000');

  return (
    <div className="rounded-xl border border-emerald-300 bg-emerald-50/50 p-4">
      <p className="text-xs font-semibold text-emerald-700 mb-3">
        {endpoint ? `Edit endpoint` : `Add endpoint for ${service.name}`}
      </p>
      <div className="space-y-2">
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Label (e.g. Localhost, Staging)"
          className="w-full px-3 py-2 rounded-lg border border-ink-200 bg-white text-sm text-ink-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
        />
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://your-service.example.com"
          className="w-full px-3 py-2 rounded-lg border border-ink-200 bg-white text-sm text-ink-900 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
        />
      </div>
      <div className="flex justify-end gap-2 mt-3">
        <button onClick={onCancel} className="px-3 py-1.5 rounded-lg text-xs text-ink-600 hover:bg-ink-100">
          Cancel
        </button>
        <button
          onClick={() => label.trim() && url.trim() && onSave(label.trim(), url.trim())}
          disabled={!label.trim() || !url.trim()}
          className="px-3 py-1.5 rounded-lg text-xs bg-emerald-500 text-white hover:bg-emerald-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {endpoint ? 'Update' : 'Add'}
        </button>
      </div>
    </div>
  );
}

// =============================================================================
// Badge in sidebar (shows summary, opens the editor)
// =============================================================================

interface EndpointBadgeProps {
  onOpenSettings: () => void;
}

export function EndpointBadge({ onOpenSettings }: EndpointBadgeProps) {
  const config = loadEndpointConfig();
  const activeCount = config.services.filter((s) => s.endpoints.some((e) => e.active)).length;
  const totalEndpoints = config.services.reduce((sum, s) => sum + s.endpoints.length, 0);

  return (
    <button
      onClick={onOpenSettings}
      className="w-full text-left rounded-xl bg-white border border-ink-100 p-3 hover:border-ink-200 transition"
    >
      <div className="flex items-center justify-between">
        <p className="text-xs text-ink-500">API Endpoints</p>
        <Icon.Gear className="w-3.5 h-3.5 text-ink-400" />
      </div>
      <div className="flex items-center gap-1.5 mt-1">
        <span className={`w-2 h-2 rounded-full ${activeCount === config.services.length ? 'bg-emerald-500' : 'bg-amber-500'}`} />
        <p className="text-xs font-medium text-ink-900 truncate">
          {totalEndpoints} endpoint{totalEndpoints === 1 ? '' : 's'} configured
        </p>
      </div>
    </button>
  );
}
