import { useState } from 'react';
import { Questionnaire } from './components/Questionnaire';
import { ChatView } from './components/ChatView';
import { TabContent } from './views/TabViews';
import { tabs } from './components/tabs';
import { Icon } from './components/icons';
import type { AnalysisData, BusinessProfile, ChatMessage, TabKey } from './types';
import { api } from './api/client';
import type { SampleId } from './data';
import { sampleList } from './data';

export default function App() {
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [sampleId, setSampleId] = useState<SampleId | null>(null);
  const [data, setData] = useState<AnalysisData | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [tab, setTab] = useState<TabKey>('chat');
  const [thinking, setThinking] = useState(false);

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

  if (!data || !profile || !sampleId) {
    return <Questionnaire onSubmit={handleSubmit} />;
  }

  return (
    <div className="h-full flex bg-ink-50/30">
      <Sidebar
        profile={profile}
        sampleId={sampleId}
        activeTab={tab}
        onTabChange={setTab}
        onSwitch={reset}
      />
      <main className="flex-1 min-w-0 bg-white">
        {tab === 'chat' ? (
          <ChatView
            data={data}
            messages={messages}
            onSend={handleSend}
            thinking={thinking}
            onSwitchSample={reset}
          />
        ) : (
          <TabContent tab={tab} data={data} />
        )}
      </main>
    </div>
  );
}

function Sidebar({
  profile, sampleId, activeTab, onTabChange, onSwitch,
}: {
  profile: BusinessProfile;
  sampleId: SampleId;
  activeTab: TabKey;
  onTabChange: (t: TabKey) => void;
  onSwitch: () => void;
}) {
  const meta = sampleList.find((s) => s.id === sampleId);
  return (
    <aside className="w-64 shrink-0 border-r border-ink-100 bg-ink-50/30 flex flex-col">
      <div className="px-4 py-4 border-b border-ink-100">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center">
            <Icon.Sparkles className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-ink-900 truncate">Competitive Insights</p>
            <p className="text-xs text-ink-500 truncate">{profile.businessName}</p>
          </div>
        </div>
      </div>

      <button
        onClick={() => onTabChange('chat')}
        className="m-3 rounded-xl border border-dashed border-ink-200 bg-white px-3 py-2.5 text-left hover:border-ink-300 hover:bg-ink-50 transition"
      >
        <p className="text-xs font-semibold text-ink-500">+ New question</p>
        <p className="text-sm text-ink-900 truncate mt-0.5">Ask anything about {profile.businessName}</p>
      </button>

      <nav className="px-2 space-y-0.5">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => onTabChange(t.key)}
            className={`w-full flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition ${activeTab === t.key ? 'bg-white text-ink-900 shadow-soft border border-ink-100' : 'text-ink-600 hover:text-ink-900 hover:bg-white'}`}
          >
            <t.Icon className={`w-4 h-4 ${activeTab === t.key ? 'text-emerald-600' : 'text-ink-500'}`} />
            <span className="flex-1 text-left">{t.label}</span>
            {activeTab === t.key && <Icon.ChevronRight className="w-3.5 h-3.5 text-ink-400" />}
          </button>
        ))}
      </nav>

      <div className="mt-auto p-3 border-t border-ink-100">
        <div className="rounded-xl bg-white border border-ink-100 p-3">
          <p className="text-xs text-ink-500">Sample analysis</p>
          <p className="text-sm font-medium text-ink-900 mt-0.5">{meta?.label}</p>
          <button onClick={onSwitch} className="mt-2 text-xs text-ink-600 hover:text-ink-900 inline-flex items-center gap-1">
            <Icon.Refresh className="w-3 h-3" /> Switch analysis
          </button>
        </div>
      </div>
    </aside>
  );
}