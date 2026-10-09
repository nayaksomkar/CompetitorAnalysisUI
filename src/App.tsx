import { useRef, useState } from 'react';
import { Questionnaire } from './components/Questionnaire';
import { TabContent } from './views/TabViews';
import { tabs } from './components/tabs';
import { Icon } from './components/icons';
import { ServerStatus } from './components/ServerStatus';
import { EndpointSettings, EndpointBadge } from './components/EndpointSettings';
import { ErrorBoundary } from './components/ErrorBoundary';
import type { AnalysisData, BusinessProfile, OrchestratorResponse, TabKey } from './types';
import { api } from './api/client';
import type { SampleId } from './data';
import { sampleList as staticSampleList, isGitHubConfigured } from './data';
import { ExplainPanelProvider } from './components/Explain';
import { ActionResultView } from './components/ActionResult';
import type { ContextualAction } from './actions';

export default function App() {
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [sampleId, setSampleId] = useState<SampleId | null>(null);
  const [data, setData] = useState<AnalysisData | null>(null);
  const [tab, setTab] = useState<TabKey>('overview');
  const [actionResult, setActionResult] = useState<{ response: OrchestratorResponse; action: ContextualAction } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [missingData, setMissingData] = useState<NonNullable<OrchestratorResponse['missing_data']>>([]);
  const sampleLoadId = useRef(0);

  const handleSubmit = async (p: BusinessProfile, s: SampleId | null) => {
  if (loading) return;
  setSubmitError(null);
  setMissingData([]);
  const loadId = ++sampleLoadId.current;

  if (s) {
    const local = api.getLocalSample(s);
    if (local) {
      setData(local);
      setProfile(local.profile);
      setSampleId(s);
      setActionResult(null);
      setTab('overview');
      setLoading(false);

      void api.loadSample(s).then((remote) => {
        if (sampleLoadId.current !== loadId) return;
        setData(remote);
        setProfile(remote.profile);
      }).catch((error: unknown) => {
        if (sampleLoadId.current === loadId) {
          console.warn(`[data] Unable to refresh ${s} from GitHub; keeping the local dataset.`, error);
        }
      });
      return;
    }
  }

  setLoading(true);
  try {
    if (s) {
      const full = await api.loadSample(s);
      if (sampleLoadId.current !== loadId) return;
      setData(full);
      setProfile(full.profile);
      setSampleId(s);
    } else {
      const result = await api.bootstrap(p);
      if (sampleLoadId.current !== loadId) return;
      setData(result.data);
      setProfile(p);
      setSampleId(null);
      setMissingData(result.missingData);
    }
    setActionResult(null);
    setTab('overview');
  } catch (error) {
    setSubmitError(error instanceof Error ? error.message : 'Unable to load the analysis.');
  } finally {
    setLoading(false);
  }
  };

  const reset = () => {
  sampleLoadId.current += 1;
  setProfile(null); setSampleId(null); setData(null); setActionResult(null); setMissingData([]); setSubmitError(null); setTab('overview');
  };

  const hardReset = () => {
  localStorage.clear();
  sessionStorage.clear();
  window.location.reload();
  };

  const handleTabChange = (t: TabKey) => {
  setTab(t);
  setSidebarOpen(false);
  };

  if (!data || !profile) {
  return <Questionnaire onSubmit={handleSubmit} loading={loading} error={submitError} />;
  }

  return (
  <ExplainPanelProvider
  data={data}
  isSavedAnalysis={sampleId !== null}
  onAction={(action, currentData, options) => api.executeAction(action, currentData, options)}
  onActionResult={(response, action) => {
  setActionResult({ response, action });
  setTab(getActionTab(action.action));
  }}
  >
  <div className="h-full flex bg-ink-50/30 ">
  {/* Mobile overlay */}
  {sidebarOpen && (
  <div 
  className="fixed inset-0 bg-black/50 z-40 lg:hidden"
  onClick={() => setSidebarOpen(false)}
  />
  )}

  {/* Sidebar */}
  <Sidebar
  profile={profile}
  sampleId={sampleId}
  activeTab={tab}
  onTabChange={handleTabChange}
  onSwitch={reset}
  onHardReset={hardReset}
  isOpen={sidebarOpen}
  onClose={() => setSidebarOpen(false)}
  onOpenSettings={() => setSettingsOpen(true)}
  />

  {/* Main content */}
  <main className="flex-1 min-w-0 min-h-0 bg-white flex flex-col overflow-hidden">
  {/* Mobile header */}
  <div className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-ink-100 bg-white shrink-0">
  <button
  onClick={() => setSidebarOpen(true)}
  className="p-2 rounded-lg hover:bg-ink-100 text-ink-600"
  >
  <Icon.Menu className="w-5 h-5" />
  </button>
  <div className="flex-1 min-w-0">
  <p className="text-sm font-semibold text-ink-900 truncate">{profile.businessName}</p>
  </div>
  </div>

  <div className="flex flex-1 min-h-0 flex-col overflow-hidden">
  {submitError && (
  <div role="alert" className="shrink-0 px-4 py-3 bg-rose-50 border-b border-rose-200 text-sm text-rose-800 flex items-start justify-between gap-3">
  <div className="min-w-0">
  <p className="font-medium">We could not load the analysis</p>
  <p className="mt-0.5 text-xs text-rose-700 break-words">{submitError}</p>
  </div>
  <button onClick={() => setSubmitError(null)} className="shrink-0 text-rose-500 hover:text-rose-700" aria-label="Dismiss">
  <Icon.X className="h-4 w-4" />
  </button>
  </div>
  )}
  {missingData.length > 0 && (
  <div role="status" className="shrink-0 px-4 py-3 bg-amber-50 border-b border-amber-200 text-sm text-amber-900">
  <p className="font-medium">Analysis is incomplete</p>
  <ul className="mt-1 list-disc pl-5">
  {missingData.map((item, index) => <li key={`${item.field}-${index}`}>{item.field}: {item.reason}</li>)}
  </ul>
  </div>
  )}
  {sampleId === null && data.sources.length === 0 && (
  <div role="status" className="shrink-0 px-4 py-2 bg-amber-50 border-b border-amber-200 text-xs text-amber-900">
  This analysis has no supporting sources. Treat narrative claims and metrics as unverified.
  </div>
  )}
  {actionResult && (
  <ActionResultView
  result={actionResult.response}
  action={actionResult.action}
  onDismiss={() => setActionResult(null)}
  />
  )}
  <div className="flex-1 min-h-0 overflow-hidden">
  <ErrorBoundary>
  <TabContent tab={tab} data={data} />
  </ErrorBoundary>
  </div>
  </div>

  {/* Footer warning */}
  <div className="shrink-0 px-4 py-2 border-t border-rose-200/60  bg-rose-50/80 ">
  <p className="text-xs text-rose-600  text-center flex items-center justify-center gap-1.5">
  <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-400  animate-pulse" />
  Runs on free Render hosting and a free AI API, so responses may take a little longer.
  </p>
  </div>
  </main>

  {/* Endpoint Settings Modal */}
  <EndpointSettings
  isOpen={settingsOpen}
  onClose={() => setSettingsOpen(false)}
  onSave={() => {
  // Optionally refresh data with new endpoint
  }}
  />
  </div>
  </ExplainPanelProvider>
  );
}

function Sidebar({
  profile, sampleId, activeTab, onTabChange, onSwitch, onHardReset, isOpen, onClose, onOpenSettings,
}: {
  profile: BusinessProfile;
  sampleId: SampleId | null;
  activeTab: TabKey;
  onTabChange: (t: TabKey) => void;
  onSwitch: () => void;
  onHardReset: () => void;
  isOpen: boolean;
  onClose: () => void;
  onOpenSettings: () => void;
}) {
  const meta = staticSampleList.find((s) => s.id === sampleId);
  return (
  <aside className={`
  fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-200 ease-in-out
  lg:relative lg:translate-x-0 lg:w-64 lg:shrink-0
  ${isOpen ? 'translate-x-0' : '-translate-x-full'}
  border-r border-ink-100 bg-ink-50/95 backdrop-blur-sm lg:bg-ink-50/30
  flex flex-col
  `}>
  <div className="px-4 py-4 border-b border-ink-100">
  <div className="flex items-center gap-2">
  <div className="h-8 w-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0">
  <Icon.Sparkles className="w-4 h-4" />
  </div>
  <div className="min-w-0 flex-1">
  <p className="text-sm font-semibold text-ink-900 truncate">Competitive Insights</p>
  <p className="text-xs text-ink-500 truncate">{profile.businessName}</p>
  </div>
  <button
  onClick={onClose}
  className="p-1.5 rounded-lg hover:bg-ink-100 text-ink-500 lg:hidden"
  >
  <Icon.X className="w-5 h-5" />
  </button>
  </div>
  </div>

  <nav className="px-2 space-y-0.5 overflow-y-auto flex-1">
  {tabs.map((t) => (
  <button
  key={t.key}
  onClick={() => onTabChange(t.key)}
  className={`w-full flex items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-sm transition ${activeTab === t.key ? 'bg-white text-ink-900 shadow-soft border border-ink-100' : 'text-ink-600 hover:text-ink-900 hover:bg-white'}`}
  >
  <t.Icon className={`w-4 h-4 ${activeTab === t.key ? 'text-emerald-600' : 'text-ink-500'}`} />
  <span className="flex-1 text-left">{t.label}</span>
  {activeTab === t.key && <Icon.ChevronRight className="w-3.5 h-3.5 text-ink-400" />}
  </button>
  ))}
  </nav>

  <div className="p-3 border-t border-ink-100 space-y-2">
  <ServerStatus enabled={!sampleId} />
  <EndpointBadge onOpenSettings={onOpenSettings} />
  {isGitHubConfigured() && (
  <a
  href={`https://github.com/${import.meta.env.VITE_DATA_REPO || 'nayaksomkar/CompetitorAnalysisUI'}`}
  target="_blank"
  rel="noreferrer"
  className="block rounded-xl bg-white border border-ink-100 p-3 hover:border-ink-200 transition"
  >
  <div className="flex items-center gap-2">
  <Icon.Link className="w-3.5 h-3.5 text-ink-400" />
  <p className="text-xs font-medium text-ink-700">Data from GitHub</p>
  </div>
  <p className="text-[10px] text-ink-400 truncate mt-0.5 font-mono">
  {import.meta.env.VITE_DATA_REPO || 'nayaksomkar/CompetitorAnalysisUI'}
  </p>
  </a>
  )}
  <div className="rounded-xl bg-white border border-ink-100 p-3">
  <p className="text-xs text-ink-500">{sampleId ? 'Sample analysis' : 'Dynamic analysis'}</p>
  <p className="text-sm font-medium text-ink-900 mt-0.5">{meta?.label ?? profile.businessName}</p>
  <div className="flex gap-2 mt-2">
  <button onClick={onSwitch} className="text-xs text-ink-600 hover:text-ink-900 inline-flex items-center gap-1">
  <Icon.Refresh className="w-3 h-3" /> Switch
  </button>
  <button onClick={onHardReset} className="text-xs text-rose-500 hover:text-rose-700 inline-flex items-center gap-1">
  <Icon.Trash className="w-3 h-3" /> Hard Reset
  </button>
  </div>
  </div>
  </div>
  </aside>
  );
}

function getActionTab(action: ContextualAction['action']): TabKey {
  if (action === 'show_pricing' || action === 'show_price_gaps' || action === 'explain_premium_positioning') return 'pricing';
  if (action === 'show_sources' || action === 'show_supporting_evidence') return 'sources';
  if (action === 'show_market_gap' || action === 'explain_opportunity') return 'market-gaps';
  if (action === 'explore_related_products') return 'products';
  if (action === 'show_affected_competitors' || action === 'compare_competitors' || action === 'show_market_position' || action === 'show_weaknesses' || action === 'show_strengths') return 'competitors';
  if (action === 'show_supporting_data' || action === 'explore_implications') return 'insights';
  if (action === 'show_market_share' || action === 'show_growth' || action === 'show_underlying_data' || action === 'explain_trend') return 'overview';
  return 'overview';
}
