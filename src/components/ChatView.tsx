import { useEffect, useRef, useState } from 'react';
import { Icon } from './icons';
import { Badge, Card } from './primitives';
import { ExplainButton } from './Explain';
import { CompetitorCard, SwotGrid } from './CompetitorCard';
import { ComparisonTable } from './ComparisonTable';
import { PricingTable } from './PricingTable';
import { ProductBreakdown } from './ProductBreakdown';
import { Chart } from './Chart';
import { InsightCard, MarketGapCard, ReportCard, ActionPlanList } from './AssetCards';
import type { ChatMessage, ChatAsset, AnalysisData } from '../types';

interface ChatProps {
  data: AnalysisData;
  messages: ChatMessage[];
  onSend: (text: string) => void;
  thinking?: boolean;
  onSwitchSample?: () => void;
}

const suggestions = [
  'Give me an overview',
  'Show me a SWOT for the biggest threat',
  'Compare pricing across the top competitors',
  'Where are the biggest market gaps?',
  'Recommend an action plan',
  'Show me a chart of market share',
];

export function ChatView({ data, messages, onSend, thinking, onSwitchSample }: ChatProps) {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages.length, thinking]);

  const submit = (text: string) => {
    if (!text.trim()) return;
    onSend(text.trim());
    setInput('');
  };

  return (
    <div className="flex flex-col h-full">
      <header className="px-6 py-4 border-b border-ink-100 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-ink-900">Chat — {data.profile.businessName}</h1>
          <p className="text-xs text-ink-500">Ask anything about the analysis. Answers include interactive assets.</p>
        </div>
        <div className="flex items-center gap-2">
          {onSwitchSample && (
            <button onClick={onSwitchSample} className="btn-secondary text-xs">
              <Icon.Refresh />
              Switch analysis
            </button>
          )}
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-thin px-6 py-6 space-y-6">
        {messages.map((m) => (
          <Message key={m.id} message={m} data={data} />
        ))}
        {thinking && <ThinkingDots />}
      </div>

      <div className="border-t border-ink-100 px-6 py-4 bg-white">
        <div className="flex flex-wrap gap-2 mb-3">
          {suggestions.map((s) => (
            <button key={s} onClick={() => submit(s)} className="pill bg-ink-50 text-ink-700 hover:bg-ink-100 border border-ink-100">
              {s}
            </button>
          ))}
        </div>
        <div className="flex items-end gap-2 rounded-2xl border border-ink-200 bg-white p-2 shadow-soft">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                submit(input);
              }
            }}
            placeholder={`Ask about ${data.profile.businessName}…`}
            rows={1}
            className="flex-1 resize-none outline-none bg-transparent px-2 py-1.5 text-sm placeholder:text-ink-400 max-h-40"
          />
          <button
            onClick={() => submit(input)}
            disabled={!input.trim() || thinking}
            className="btn-primary"
          >
            <Icon.Send />
            <span className="hidden sm:inline">Send</span>
          </button>
        </div>
        <p className="text-[11px] text-ink-400 mt-2">Press Enter to send, Shift+Enter for newline.</p>
      </div>
    </div>
  );
}

function Message({ message, data }: { message: ChatMessage; data: AnalysisData }) {
  if (message.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-2xl chat-bubble-user">
          <p className="text-sm text-ink-900 whitespace-pre-wrap">{message.text}</p>
        </div>
      </div>
    );
  }
  return (
    <div className="flex justify-start">
      <div className="max-w-3xl w-full space-y-3">
        {message.text && (
          <div className="chat-bubble-assistant">
            <div className="flex items-start gap-2">
              <Icon.Sparkles className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              <div className="prose-chat text-sm text-ink-900 leading-relaxed">
                {renderInline(message.text)}
              </div>
            </div>
          </div>
        )}
        {message.assets?.map((a, i) => (
          <AssetRender key={i} asset={a} data={data} />
        ))}
      </div>
    </div>
  );
}

function AssetRender({ asset, data }: { asset: ChatAsset; data: AnalysisData }) {
  switch (asset.kind) {
    case 'competitor-card': return <CompetitorCard competitor={asset.data} />;
    case 'comparison-table': return <ComparisonTable data={asset.data} />;
    case 'pricing-table': return <PricingTable title={asset.data.title} tiers={asset.data.tiers} />;
    case 'product-breakdown': return <ProductBreakdown product={asset.data} />;
    case 'chart': return <Chart data={asset.data} />;
    case 'swot': return (
      <Card>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-ink-900">SWOT — {data.competitors.find((c) => c.id === asset.data.competitorId)?.name}</h3>
          {asset.explanation && <ExplainButton explanation={asset.explanation} />}
        </div>
        <SwotGrid swot={asset.data.swot} />
      </Card>
    );
    case 'market-gap': return <MarketGapCard gap={asset.data} />;
    case 'insight': return <InsightCard item={asset.data} />;
    case 'report': return <ReportCard report={asset.data} />;
    case 'action-plan': return <ActionPlanList title={asset.data.title} items={asset.data.items} explanation={asset.explanation} />;
    default: {
      const _exhaustive: never = asset;
      void _exhaustive;
      return null;
    }
  }
}

function ThinkingDots() {
  return (
    <div className="flex justify-start">
      <div className="chat-bubble-assistant">
        <div className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-ink-400 animate-pulse-dot" style={{ animationDelay: '0ms' }} />
          <span className="h-1.5 w-1.5 rounded-full bg-ink-400 animate-pulse-dot" style={{ animationDelay: '150ms' }} />
          <span className="h-1.5 w-1.5 rounded-full bg-ink-400 animate-pulse-dot" style={{ animationDelay: '300ms' }} />
          <span className="ml-2 text-xs text-ink-500">Analyzing…</span>
        </div>
      </div>
    </div>
  );
}

// Minimal markdown-style renderer for **bold**
function renderInline(s: string): React.ReactNode {
  const parts = s.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) => {
    if (p.startsWith('**') && p.endsWith('**')) {
      return <strong key={i} className="font-semibold text-ink-900">{p.slice(2, -2)}</strong>;
    }
    return <span key={i}>{p}</span>;
  });
}

// Re-export to keep tree-shaking friendly
export { Badge };