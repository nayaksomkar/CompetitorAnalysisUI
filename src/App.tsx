import { useState } from 'react';
import { Questionnaire } from './components/Questionnaire';
import { ChatView } from './components/ChatView';
import { TabContent } from './views/TabViews';
import { tabs } from './components/tabs';
import { Icon } from './components/icons';
import { ServerStatus } from './components/ServerStatus';
import { EndpointSettings, EndpointBadge } from './components/EndpointSettings';
import type { AnalysisData, BusinessProfile, ChatMessage, TabKey } from './types';
import { api } from './api/client';
import type { SampleId } from './data';
import { sampleList as staticSampleList, isGitHubConfigured } from './data';

export default function App() {
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [sampleId, setSampleId] = useState<SampleId | null>(null);
  const [data, setData] = useState<AnalysisData | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [tab, setTab] = useState<TabKey>('chat');
  const [thinking, setThinking] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleSubmit = async (p: BusinessProfile, s: SampleId) => {
  setProfile(p);
  setSampleId(s);
  const full = await api.bootstrap(p, s);
  setData(full);
  setMessages(full.conversation);
  setTab('chat');
  };

  const handleSend = async (text: string) => {
  if (!data) return;
  const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: 'user', text, createdAt: Date.now() };
  const placeholder: ChatMessage = { id: `a-${Date.now()}`, role: 'assistant', createdAt: Date.now() + 1, streaming: true };
  setMessages((m) => [...m, userMsg, placeholder]);
  setThinking(true);
  try {
  const res = await api.ask({ prompt: text, context: data });
  const finalMsg: ChatMessage = {
  id: placeholder.id,
  role: 'assistant',
  text: res.text,
  assets: res.assets,
  createdAt: Date.now(),
  };
  setMessages((m) => m.map((x) => (x.id === placeholder.id ? finalMsg : x)));
  } finally {
  setThinking(false);
  }
  };

  const reset = () => {
  setProfile(null); setSampleId(null); setData(null); setMessages([]); setTab('chat');
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

  if (!data || !profile || !sampleId) {
  return <Questionnaire onSubmit={handleSubmit} />;
  }

  return (
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

  <div className="flex-1 min-h-0 overflow-hidden">
  {tab === 'chat' ? (
  <ChatView
  data={data}
  messages={messages}
  onSend={handleSend}
  thinking={thinking}
  onSwitchSample={reset}
  onCreateOverview={(focusText) => {
  const t = Date.now();
  const userMsg: ChatMessage = {
  id: `u-ov-${t}`,
  role: 'user',
  text: focusText ? `Overview: ${focusText}` : 'Chat overview',
  createdAt: t,
  };
  const dashMsg: ChatMessage = {
  id: `a-ov-${t}`,
  role: 'assistant',
  createdAt: t + 1,
  text: focusText
  ? `Here's a focused overview on "${focusText}". Scroll through — and ask me anything.`
  : `Here's the full competitive overview for ${data.profile.businessName}. Scroll through the sections below — and ask me anything about it.`,
  assets: [{ kind: 'dashboard', data, focusText }],
  };
  setMessages((m) => [...m, userMsg, dashMsg]);
  }}
  />
  ) : (
  <TabContent tab={tab} data={data} />
  )}
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
  );
}

function Sidebar({
  profile, sampleId, activeTab, onTabChange, onSwitch, onHardReset, isOpen, onClose, onOpenSettings,
}: {
  profile: BusinessProfile;
  sampleId: SampleId;
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

  <button
  onClick={() => onTabChange('chat')}
  className="m-3 rounded-xl border border-dashed border-ink-200 bg-white px-3 py-2.5 text-left hover:border-ink-300 hover:bg-ink-50 transition"
  >
  <p className="text-xs font-semibold text-ink-500">+ New question</p>
  <p className="text-sm text-ink-900 truncate mt-0.5">Ask anything about {profile.businessName}</p>
  </button>

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
  <ServerStatus />
  <EndpointBadge onOpenSettings={onOpenSettings} />
  {isGitHubConfigured() && (
  <a
  href={`https://github.com/${import.meta.env.VITE_DATA_REPO}`}
  target="_blank"
  rel="noreferrer"
  className="block rounded-xl bg-white border border-ink-100 p-3 hover:border-ink-200 transition"
  >
  <div className="flex items-center gap-2">
  <Icon.Link className="w-3.5 h-3.5 text-ink-400" />
  <p className="text-xs font-medium text-ink-700">Data from GitHub</p>
  </div>
  <p className="text-[10px] text-ink-400 truncate mt-0.5 font-mono">
  {import.meta.env.VITE_DATA_REPO}
  </p>
  </a>
  )}
  <div className="rounded-xl bg-white border border-ink-100 p-3">
  <p className="text-xs text-ink-500">Sample analysis</p>
  <p className="text-sm font-medium text-ink-900 mt-0.5">{meta?.label}</p>
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
