import { useState } from 'react';
import { Icon } from './icons';
import { Modal } from './Modal';

interface EndpointConfig {
  localhost: string;
  render: string;
  activeEndpoint: 'localhost' | 'render';
}

const STORAGE_KEY = 'endpoint_config';

const DEFAULT_CONFIG: EndpointConfig = {
  localhost: 'http://localhost:8000',
  render: 'https://competitorengine.onrender.com',
  activeEndpoint: 'render',
};

export function loadEndpointConfig(): EndpointConfig {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return { ...DEFAULT_CONFIG, ...JSON.parse(stored) };
  } catch { /* ignore */ }
  return DEFAULT_CONFIG;
}

export function saveEndpointConfig(config: EndpointConfig): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

export function getActiveBaseUrl(): string {
  const config = loadEndpointConfig();
  return config.activeEndpoint === 'localhost' ? config.localhost : config.render;
}

interface EndpointSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: EndpointConfig) => void;
}

export function EndpointSettings({ isOpen, onClose, onSave }: EndpointSettingsProps) {
  const [config, setConfig] = useState<EndpointConfig>(loadEndpointConfig);
  const [localhost, setLocalhost] = useState(config.localhost);
  const [render, setRender] = useState(config.render);
  const [activeEndpoint, setActiveEndpoint] = useState<'localhost' | 'render'>(config.activeEndpoint);
  const [localhostStatus, setLocalhostStatus] = useState<'idle' | 'checking' | 'online' | 'offline'>('idle');
  const [renderStatus, setRenderStatus] = useState<'idle' | 'checking' | 'online' | 'offline'>('idle');

  const checkHealth = async (url: string, setter: (s: 'idle' | 'checking' | 'online' | 'offline') => void) => {
    setter('checking');
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(`${url}/health`, { signal: controller.signal });
      clearTimeout(timeout);
      setter(res.ok ? 'online' : 'offline');
    } catch {
      setter('offline');
    }
  };

  const handleSave = () => {
    const newConfig: EndpointConfig = { localhost, render, activeEndpoint };
    setConfig(newConfig);
    saveEndpointConfig(newConfig);
    onSave(newConfig);
    onClose();
  };

  return (
    <Modal open={isOpen} onClose={onClose} title="API Endpoints" subtitle="Configure backend URLs for testing">
      <div className="space-y-4">
        {/* Localhost Endpoint */}
        <div className="rounded-xl border border-ink-200 dark:border-ink-600 p-4">
          <div className="flex items-center justify-between mb-3">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="activeEndpoint"
                checked={activeEndpoint === 'localhost'}
                onChange={() => setActiveEndpoint('localhost')}
                className="w-4 h-4 text-emerald-500"
              />
              <span className="text-sm font-semibold text-ink-900 dark:text-ink-100">Localhost</span>
            </label>
            <button
              onClick={() => checkHealth(localhost, setLocalhostStatus)}
              className="text-xs px-2 py-1 rounded-lg bg-ink-100 dark:bg-ink-700 text-ink-600 dark:text-ink-300 hover:bg-ink-200 dark:hover:bg-ink-600"
            >
              {localhostStatus === 'checking' ? 'Checking...' : 'Test'}
            </button>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={localhost}
              onChange={(e) => setLocalhost(e.target.value)}
              placeholder="http://localhost:8000"
              className="flex-1 px-3 py-2 rounded-lg border border-ink-200 dark:border-ink-600 bg-white dark:bg-ink-800 text-sm text-ink-900 dark:text-ink-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            />
            {localhostStatus === 'online' && (
              <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Online
              </span>
            )}
            {localhostStatus === 'offline' && (
              <span className="flex items-center gap-1 text-xs text-rose-600 dark:text-rose-400">
                <span className="w-2 h-2 rounded-full bg-rose-500" /> Offline
              </span>
            )}
          </div>
          <p className="text-xs text-ink-500 dark:text-ink-400 mt-2">Your local development server</p>
        </div>

        {/* Render Endpoint */}
        <div className="rounded-xl border border-ink-200 dark:border-ink-600 p-4">
          <div className="flex items-center justify-between mb-3">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="activeEndpoint"
                checked={activeEndpoint === 'render'}
                onChange={() => setActiveEndpoint('render')}
                className="w-4 h-4 text-emerald-500"
              />
              <span className="text-sm font-semibold text-ink-900 dark:text-ink-100">Render (Cloud)</span>
            </label>
            <button
              onClick={() => checkHealth(render, setRenderStatus)}
              className="text-xs px-2 py-1 rounded-lg bg-ink-100 dark:bg-ink-700 text-ink-600 dark:text-ink-300 hover:bg-ink-200 dark:hover:bg-ink-600"
            >
              {renderStatus === 'checking' ? 'Checking...' : 'Test'}
            </button>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={render}
              onChange={(e) => setRender(e.target.value)}
              placeholder="https://your-service.onrender.com"
              className="flex-1 px-3 py-2 rounded-lg border border-ink-200 dark:border-ink-600 bg-white dark:bg-ink-800 text-sm text-ink-900 dark:text-ink-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            />
            {renderStatus === 'online' && (
              <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Online
              </span>
            )}
            {renderStatus === 'offline' && (
              <span className="flex items-center gap-1 text-xs text-rose-600 dark:text-rose-400">
                <span className="w-2 h-2 rounded-full bg-rose-500" /> Offline
              </span>
            )}
          </div>
          <p className="text-xs text-ink-500 dark:text-ink-400 mt-2">Your deployed Render service</p>
        </div>

        {/* Active Selection Info */}
        <div className="rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 p-3">
          <p className="text-xs text-emerald-700 dark:text-emerald-300">
            <Icon.Check className="w-3 h-3 inline mr-1" />
            Active: <strong>{activeEndpoint === 'localhost' ? localhost : render}</strong>
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm text-ink-600 dark:text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-700"
          >
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

interface EndpointBadgeProps {
  onOpenSettings: () => void;
}

export function EndpointBadge({ onOpenSettings }: EndpointBadgeProps) {
  const config = loadEndpointConfig();
  const isActiveLocal = config.activeEndpoint === 'localhost';

  return (
    <button
      onClick={onOpenSettings}
      className="w-full text-left rounded-xl bg-white dark:bg-ink-700 border border-ink-100 dark:border-ink-600 p-3 hover:border-ink-200 dark:hover:border-ink-500 transition"
    >
      <div className="flex items-center justify-between">
        <p className="text-xs text-ink-500 dark:text-ink-400">API Endpoint</p>
        <Icon.Gear className="w-3.5 h-3.5 text-ink-400" />
      </div>
      <div className="flex items-center gap-1.5 mt-1">
        <span className={`w-2 h-2 rounded-full ${isActiveLocal ? 'bg-amber-500' : 'bg-emerald-500'}`} />
        <p className="text-xs font-medium text-ink-900 dark:text-ink-100 truncate">
          {isActiveLocal ? 'Localhost' : 'Render'}
        </p>
      </div>
    </button>
  );
}
