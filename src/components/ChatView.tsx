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
import { OverviewDashboard } from './OverviewDashboard';
import { ContextMenu, type ContextMenuOption } from './ContextMenu';
import type { ChatMessage, ChatAsset, AnalysisData, LookupCompetitor } from '../types';
import { QUICK_ACTIONS, getQuickActionId } from '../localResponses';
import type { QuickActionId } from '../localResponses';

interface ChatProps {
  data: AnalysisData;
  messages: ChatMessage[];
  onSend: (text: string) => void;
  onLocalSend?: (actionId: QuickActionId) => void;
  thinking?: boolean;
  onSwitchSample?: () => void;
  onCreateOverview?: (focusText?: string) => void;
}

export function ChatView({ data, messages, onSend, onLocalSend, thinking, onSwitchSample, onCreateOverview }: ChatProps) {
  const [input, setInput] = useState('');
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; text: string } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressFired = useRef(false);

  useEffect(() => {
  scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages.length, thinking, messages[messages.length - 1]?.assets?.length]);

  const startLongPress = (e: React.MouseEvent | React.TouchEvent, text: string) => {
  longPressFired.current = false;
  const point = 'touches' in e ? e.touches[0] : e;
  longPressTimer.current = setTimeout(() => {
  longPressFired.current = true;
  setContextMenu({ x: point.clientX, y: point.clientY, text });
  }, 500);
  };

  const cancelLongPress = () => {
  if (longPressTimer.current) clearTimeout(longPressTimer.current);
  longPressTimer.current = null;
  };

  const handlePointerUp = () => {
  cancelLongPress();
  // Small delay so the click handler can check longPressFired
  setTimeout(() => { longPressFired.current = false; }, 10);
  };

  const menuOptions: ContextMenuOption[] | null = contextMenu && onCreateOverview ? [
  {
  id: 'this-overview',
  label: 'Create this chat overview',
  icon: <Icon.Target />,
  onClick: () => onCreateOverview(contextMenu.text),
  },
  {
  id: 'chat-overview',
  label: 'Chat overview',
  icon: <Icon.Compass />,
  onClick: () => onCreateOverview(),
  },
  ] : null;

  const submit = (text: string) => {
  if (!text.trim()) return;
  const trimmed = text.trim();
  const actionId = getQuickActionId(trimmed);
  if (onLocalSend && actionId) {
    onLocalSend(actionId);
  } else {
    onSend(trimmed);
  }
  setInput('');
  };

  return (
  <div className="flex flex-col h-full min-h-0">
  <header className="px-4 sm:px-6 py-3 sm:py-4 border-b border-ink-100  flex items-center justify-between gap-3 shrink-0">
  <div>
  <h1 className="text-lg font-semibold text-ink-900 ">Chat — {data.profile.businessName}</h1>
  <p className="text-xs text-ink-500 ">Ask anything about the analysis. Answers include interactive assets.</p>
  </div>
  <div className="flex items-center gap-2">
  {onSwitchSample && (
  <button onClick={onSwitchSample} className="btn-secondary text-xs  ">
  <Icon.Refresh />
  Switch analysis
  </button>
  )}
  </div>
  </header>

  <div
  ref={scrollRef}
  className="flex-1 min-h-0 overflow-y-auto scrollbar-thin px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6"
  onMouseUp={handlePointerUp}
  onTouchEnd={handlePointerUp}
  onMouseLeave={cancelLongPress}
  onTouchCancel={cancelLongPress}
  onScroll={cancelLongPress}
  >
  {messages.map((m) => (
  <Message key={m.id} message={m} data={data} onLongPress={startLongPress} />
  ))}
  {thinking && <ThinkingDots />}
  </div>
  {contextMenu && menuOptions && (
  <ContextMenu x={contextMenu.x} y={contextMenu.y} options={menuOptions} onClose={() => setContextMenu(null)} />
  )}

  <div className="border-t border-ink-100  px-4 sm:px-6 py-3 sm:py-4 bg-white  shrink-0">
  <div className="flex flex-wrap gap-2 mb-3">
  {QUICK_ACTIONS.map((action) => (
  <button key={action.id} onClick={() => submit(action.label)} className="pill bg-ink-50  text-ink-700  hover:bg-ink-100 border border-ink-100 ">
  {action.label}
  </button>
  ))}
  </div>
  <div className="flex items-end gap-2 rounded-2xl border border-ink-200  bg-white  p-2 shadow-soft">
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
  className="flex-1 resize-none outline-none bg-transparent px-2 py-1.5 text-sm text-ink-900  placeholder:text-ink-400 max-h-40"
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
  <p className="text-[11px] text-ink-400  mt-2">Press Enter to send, Shift+Enter for newline.</p>
  </div>
  </div>
  );
}

function Message({ message, data, onLongPress }: { message: ChatMessage; data: AnalysisData; onLongPress: (e: React.MouseEvent | React.TouchEvent, text: string) => void }) {
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
  <div
  className="chat-bubble-assistant touch-none"
  onMouseDown={(e) => onLongPress(e, message.text ?? '')}
  onTouchStart={(e) => onLongPress(e, message.text ?? '')}
  >
  <div className="flex items-start gap-2">
  <Icon.Sparkles className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
  <div className="prose-chat text-sm text-ink-900 leading-relaxed">
  {message.streaming ? <TypewriterText text={message.text ?? ''} /> : renderInline(message.text ?? '')}
  </div>
  </div>
  </div>
  )}
  {message.assets?.map((a, i) => (
  <div key={`${i}-${a.kind}`} className="animate-fade-up">
  <AssetRender asset={a} data={data} />
  </div>
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
  case 'dashboard': return <OverviewDashboard data={asset.data} focusText={asset.focusText} />;
  case 'lookup-card': return <LookupCard competitor={asset.data} />;
  case 'lookup-comparison': return <LookupComparison data={asset.data} />;
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

function TypewriterText({ text }: { text: string }) {
  // Text is streamed in from the API/local pipeline in real-time chunks, so
  // we just render whatever has arrived and add a blinking cursor to signal
  // that more is coming.
  return (
    <span className="inline">
      {renderInline(text ?? '')}
      <span className="inline-block w-1.5 h-4 bg-emerald-500 ml-0.5 animate-pulse rounded-sm align-middle" />
    </span>
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

// ----- Lookup components (web-searched competitors) -----

function LookupCard({ competitor }: { competitor: LookupCompetitor }) {
  const confidence = competitor.lookupConfidence ?? 0;
  const confidenceColor = confidence >= 70 ? 'text-emerald-600' : confidence >= 40 ? 'text-amber-600' : 'text-rose-600';
  const confidenceLabel = confidence >= 70 ? 'High confidence' : confidence >= 40 ? 'Medium confidence' : 'Low confidence';

  return (
  <Card>
  <div className="flex items-start justify-between gap-3 mb-3">
  <div>
  <div className="flex items-center gap-2">
  <h3 className="font-semibold text-ink-900">{competitor.name}</h3>
  <Badge tone={competitor.source === 'web' ? 'blue' : 'gray'}>
  {competitor.source === 'web' ? 'From web' : 'From context'}
  </Badge>
  </div>
  {competitor.profile.pricingTier && (
  <p className="text-xs text-ink-500 mt-0.5">{competitor.profile.pricingTier} · {competitor.profile.marketPosition ?? 'Unknown position'}</p>
  )}
  </div>
  {confidence > 0 && (
  <div className={`text-xs font-medium ${confidenceColor} shrink-0`}>
  {confidenceLabel} ({confidence}%)
  </div>
  )}
  </div>

  <p className="text-sm text-ink-700 leading-relaxed mb-3">{competitor.profile.description}</p>

  <div className="grid grid-cols-2 gap-3 mb-3">
  {competitor.profile.hq && (
  <div>
  <p className="text-xs text-ink-500">HQ</p>
  <p className="text-sm font-medium text-ink-900">{competitor.profile.hq}</p>
  </div>
  )}
  {competitor.profile.founded && (
  <div>
  <p className="text-xs text-ink-500">Founded</p>
  <p className="text-sm font-medium text-ink-900">{competitor.profile.founded}</p>
  </div>
  )}
  {competitor.profile.funding && (
  <div>
  <p className="text-xs text-ink-500">Funding</p>
  <p className="text-sm font-medium text-ink-900">{competitor.profile.funding}</p>
  </div>
  )}
  {competitor.profile.marketShare != null && (
  <div>
  <p className="text-xs text-ink-500">Market share</p>
  <p className="text-sm font-medium text-ink-900">{competitor.profile.marketShare}%</p>
  </div>
  )}
  </div>

  {competitor.profile.strengths.length > 0 && (
  <div className="mb-2">
  <p className="text-xs font-semibold text-ink-500 mb-1">Strengths</p>
  <ul className="space-y-1">
  {competitor.profile.strengths.map((s, i) => (
  <li key={i} className="flex items-start gap-2 text-sm text-ink-700">
  <span className="text-emerald-600 mt-0.5">✓</span>
  {s}
  </li>
  ))}
  </ul>
  </div>
  )}

  {competitor.profile.weaknesses.length > 0 && (
  <div className="mb-3">
  <p className="text-xs font-semibold text-ink-500 mb-1">Weaknesses</p>
  <ul className="space-y-1">
  {competitor.profile.weaknesses.map((w, i) => (
  <li key={i} className="flex items-start gap-2 text-sm text-ink-700">
  <span className="text-rose-500 mt-0.5">!</span>
  {w}
  </li>
  ))}
  </ul>
  </div>
  )}

  {competitor.sources.length > 0 && (
  <div className="border-t border-ink-100 pt-3">
  <p className="text-xs font-semibold text-ink-500 mb-2">Sources</p>
  <div className="space-y-1.5">
  {competitor.sources.slice(0, 3).map((s) => (
  <div key={s.id} className="flex items-start gap-2 text-xs">
  <Icon.External className="w-3 h-3 text-ink-400 mt-0.5 shrink-0" />
  <div className="min-w-0">
  <a href={s.url} target="_blank" rel="noreferrer" className="text-ink-700 hover:text-ink-900 truncate block">
  {s.title}
  </a>
  {s.publisher && <span className="text-ink-400"> · {s.publisher}</span>}
  </div>
  </div>
  ))}
  </div>
  </div>
  )}
  </Card>
  );
}

function LookupComparison({ data }: { data: { title: string; competitors: LookupCompetitor[] } }) {
  return (
  <Card>
  <h3 className="font-semibold text-ink-900 mb-3">{data.title}</h3>
  <div className="overflow-x-auto">
  <table className="w-full text-sm">
  <thead>
  <tr className="border-b border-ink-100">
  <th className="text-left py-2 pr-4 font-medium text-ink-500">Vendor</th>
  <th className="text-left py-2 pr-4 font-medium text-ink-500">Position</th>
  <th className="text-left py-2 pr-4 font-medium text-ink-500">Pricing</th>
  <th className="text-left py-2 pr-4 font-medium text-ink-500">HQ</th>
  <th className="text-left py-2 font-medium text-ink-500">Confidence</th>
  </tr>
  </thead>
  <tbody>
  {data.competitors.map((c) => (
  <tr key={c.id} className="border-b border-ink-50 last:border-0">
  <td className="py-2 pr-4">
  <div className="flex items-center gap-2">
  <span className="font-medium text-ink-900">{c.name}</span>
  <Badge tone={c.source === 'web' ? 'blue' : 'gray'}>
  {c.source === 'web' ? 'Web' : 'Context'}
  </Badge>
  </div>
  </td>
  <td className="py-2 pr-4 text-ink-700">{c.profile.marketPosition ?? '—'}</td>
  <td className="py-2 pr-4 text-ink-700">{c.profile.pricingTier ?? '—'}</td>
  <td className="py-2 pr-4 text-ink-700">{c.profile.hq ?? '—'}</td>
  <td className="py-2">
  {c.lookupConfidence != null ? (
  <span className={`text-xs font-medium ${c.lookupConfidence >= 70 ? 'text-emerald-600' : c.lookupConfidence >= 40 ? 'text-amber-600' : 'text-rose-600'}`}>
  {c.lookupConfidence}%
  </span>
  ) : '—'}
  </td>
  </tr>
  ))}
  </tbody>
  </table>
  </div>
  </Card>
  );
}

// Re-export to keep tree-shaking friendly
export { Badge };
