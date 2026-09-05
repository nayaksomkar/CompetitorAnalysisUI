import { useEffect, useState } from 'react';
import { Questionnaire } from './components/Questionnaire';
import { ChatView } from './components/ChatView';
import { TabContent } from './views/TabViews';
import { tabs } from './components/tabs';
import { Icon } from './components/icons';
import { ServerStatus } from './components/ServerStatus';
import type { AnalysisData, BusinessProfile, ChatMessage, TabKey } from './types';
import { api } from './api/client';
import type { SampleId } from './data';
import { sampleList } from './data';

type Theme = 'light' | 'dark';

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  const stored = localStorage.getItem('theme') as Theme | null;
  if (stored) return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export default function App() {
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [sampleId, setSampleId] = useState<SampleId | null>(null);
  const [data, setData] = useState<AnalysisData | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [tab, setTab] = useState<TabKey>('chat');
  const [thinking, setThinking] = useState(false);
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Apply theme
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'));

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

  const handleTabChange = (t: TabKey) => {
    setTab(t);
    setSidebarOpen(false);
  };

  if (!data || !profile || !sampleId) {
    return <Questionnaire onSubmit={handleSubmit} />;
  }

  return (
    <div className="h-full flex bg-ink-50/30 dark:bg-ink-900">
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
        theme={theme}
        onToggleTheme={toggleTheme}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content */}
      <main className="flex-1 min-w-0 min-h-0 bg-white dark:bg-ink-800 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-ink-100 dark:border-ink-700 bg-white dark:bg-ink-800 shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-ink-100 dark:hover:bg-ink-700 text-ink-600 dark:text-ink-300"
          >
            <Icon.Menu className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-ink-900 dark:text-ink-100 truncate">{profile.businessName}</p>
          </div>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-ink-100 dark:hover:bg-ink-700 text-ink-500 dark:text-ink-400"
          >
            {theme === 'light' ? <Icon.Moon className="w-5 h-5" /> : <Icon.Sun className="w-5 h-5" />}
          </button>
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
      </main>
    </div>
  );
}

function Sidebar({
  profile, sampleId, activeTab, onTabChange, onSwitch, theme, onToggleTheme, isOpen, onClose,
}: {
  profile: BusinessProfile;
  sampleId: SampleId;
  activeTab: TabKey;
  onTabChange: (t: TabKey) => void;
  onSwitch: () => void;
  theme: Theme;
  onToggleTheme: () => void;
  isOpen: boolean;
  onClose: () => void;
}) {
  const meta = sampleList.find((s) => s.id === sampleId);
  return (
    <aside className={`
      fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-200 ease-in-out
      lg:relative lg:translate-x-0 lg:w-64 lg:shrink-0
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      border-r border-ink-100 dark:border-ink-700 bg-ink-50/95 dark:bg-ink-800/95 backdrop-blur-sm lg:bg-ink-50/30 lg:dark:bg-ink-800/50
      flex flex-col
    `}>
      <div className="px-4 py-4 border-b border-ink-100 dark:border-ink-700">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0">
            <Icon.Sparkles className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-ink-900 dark:text-ink-100 truncate">Competitive Insights</p>
            <p className="text-xs text-ink-500 dark:text-ink-400 truncate">{profile.businessName}</p>
          </div>
          <button
            onClick={onToggleTheme}
            className="p-1.5 rounded-lg hover:bg-ink-100 dark:hover:bg-ink-700 text-ink-500 dark:text-ink-400 transition-colors hidden lg:block"
            title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          >
            {theme === 'light' ? <Icon.Moon className="w-4 h-4" /> : <Icon.Sun className="w-4 h-4" />}
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-ink-100 dark:hover:bg-ink-700 text-ink-500 dark:text-ink-400 lg:hidden"
          >
            <Icon.X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <button
        onClick={() => onTabChange('chat')}
        className="m-3 rounded-xl border border-dashed border-ink-200 dark:border-ink-600 bg-white dark:bg-ink-700 px-3 py-2.5 text-left hover:border-ink-300 dark:hover:border-ink-500 hover:bg-ink-50 dark:hover:bg-ink-600 transition"
      >
        <p className="text-xs font-semibold text-ink-500 dark:text-ink-400">+ New question</p>
        <p className="text-sm text-ink-900 dark:text-ink-100 truncate mt-0.5">Ask anything about {profile.businessName}</p>
      </button>

      <nav className="px-2 space-y-0.5 overflow-y-auto flex-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => onTabChange(t.key)}
            className={`w-full flex items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-sm transition ${activeTab === t.key ? 'bg-white dark:bg-ink-700 text-ink-900 dark:text-ink-100 shadow-soft border border-ink-100 dark:border-ink-600' : 'text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-ink-100 hover:bg-white dark:hover:bg-ink-700'}`}
          >
            <t.Icon className={`w-4 h-4 ${activeTab === t.key ? 'text-emerald-600 dark:text-emerald-400' : 'text-ink-500 dark:text-ink-400'}`} />
            <span className="flex-1 text-left">{t.label}</span>
            {activeTab === t.key && <Icon.ChevronRight className="w-3.5 h-3.5 text-ink-400" />}
          </button>
        ))}
      </nav>

      <div className="p-3 border-t border-ink-100 dark:border-ink-700 space-y-2">
        <ServerStatus />
        <div className="rounded-xl bg-white dark:bg-ink-700 border border-ink-100 dark:border-ink-600 p-3">
          <p className="text-xs text-ink-500 dark:text-ink-400">Sample analysis</p>
          <p className="text-sm font-medium text-ink-900 dark:text-ink-100 mt-0.5">{meta?.label}</p>
          <button onClick={onSwitch} className="mt-2 text-xs text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-ink-200 inline-flex items-center gap-1">
            <Icon.Refresh className="w-3 h-3" /> Switch analysis
          </button>
        </div>
      </div>
    </aside>
  );
}
