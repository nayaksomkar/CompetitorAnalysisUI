import type { AnalysisData, ChatAsset } from './types';

export const QUICK_ACTIONS = [
  { id: 'overview', label: 'Give me an overview' },
  { id: 'biggest-threat-swot', label: 'Show me a SWOT for the biggest threat' },
  { id: 'pricing-comparison', label: 'Compare pricing across the top competitors' },
  { id: 'market-gaps', label: 'Where are the biggest market gaps?' },
  { id: 'action-plan', label: 'Recommend an action plan' },
  { id: 'market-share-chart', label: 'Show me a chart of market share' },
] as const;

export type QuickActionId = (typeof QUICK_ACTIONS)[number]['id'];
export type Suggestion = (typeof QUICK_ACTIONS)[number]['label'];

const ACTION_BY_LABEL = new Map<string, QuickActionId>(QUICK_ACTIONS.map((action) => [action.label, action.id]));

export function getQuickActionId(label: string): QuickActionId | undefined {
  return ACTION_BY_LABEL.get(label);
}

export function isSuggestion(text: string): text is Suggestion {
  return ACTION_BY_LABEL.has(text);
}

export function getLocalResponse(actionId: QuickActionId, data: AnalysisData): { text: string; assets: ChatAsset[] } {
  switch (actionId) {
    case 'overview':
      return {
        text: `Here's the competitive overview for ${data.businessName}. You're competing against ${data.competitors.length} key players in ${data.industry}. Scroll through the sections below — and ask me anything about it.`,
        assets: [{ kind: 'dashboard', data }],
      };

    case 'biggest-threat-swot': {
      const threat = [...data.competitors]
        .filter((c) => c.marketPosition === 'Leader' || c.marketPosition === 'Challenger')
        .sort((a, b) => (b.marketShare ?? 0) - (a.marketShare ?? 0))[0]
        ?? [...data.competitors].sort((a, b) => (b.marketShare ?? 0) - (a.marketShare ?? 0))[0];

      if (!threat) return { text: 'No competitor data available.', assets: [] };
      return {
        text: `**${threat.name}** is the biggest threat — they hold a ${threat.marketShare ?? 'significant'}% market share as a ${threat.marketPosition ?? 'competitive'} player. Here's their full SWOT:`,
        assets: [{ kind: 'swot', data: { competitorId: threat.id, swot: threat.swot, competitorName: threat.name }, explanation: threat.explanation }],
      };
    }

    case 'pricing-comparison': {
      const tiers = data.pricingTiers;
      const competitorNames = [...new Set(tiers.map((t) => data.competitors.find((c) => c.id === t.competitorId)?.name).filter((name): name is string => Boolean(name)))].slice(0, 4);
      const nameList = competitorNames.length > 1 ? `${competitorNames.slice(0, -1).join(', ')} and ${competitorNames.at(-1)}` : competitorNames[0] ?? 'the available competitors';
      return {
        text: `Here's how **${data.businessName}** compares to ${nameList} on pricing. ${tiers.length} pricing tiers are available — toggle monthly / yearly to see effective costs.`,
        assets: [{ kind: 'pricing-table', data: { title: 'Pricing Comparison', tiers } }],
      };
    }

    case 'market-gaps': {
      const gaps = [...data.marketGaps].sort((a, b) => b.opportunityScore - a.opportunityScore);
      const top = gaps.slice(0, 3);
      return {
        text: top.length > 0
          ? `The biggest gaps in ${data.industry}: **${top.map((g) => g.title).join(', ')}**. Ranked by opportunity score; the top gap scores ${top[0].opportunityScore}/100 with an estimated ${top[0].estimatedRevenue ?? 'N/A'} revenue opportunity.`
          : 'No market gap data available for this analysis.',
        assets: gaps.slice(0, 5).map((gap) => ({ kind: 'market-gap' as const, data: gap })),
      };
    }

    case 'action-plan':
      return {
        text: data.actionPlan.length > 0
          ? `Here's a ${data.actionPlan.length}-step action plan, starting with the highest-priority items. Items are sequenced by effort vs. impact — quick wins first, strategic bets later.`
          : 'No action plan data available.',
        assets: [{ kind: 'action-plan', data: { title: 'Recommended Action Plan', items: data.actionPlan } }],
      };

    case 'market-share-chart': {
      const leader = [...data.competitors].sort((a, b) => (b.marketShare ?? 0) - (a.marketShare ?? 0))[0];
      return {
        text: leader?.marketShare
          ? `**${leader.name}** leads with ${leader.marketShare}% market share. The full competitive landscape:`
          : 'Market share breakdown across competitors:',
        assets: [{ kind: 'chart', data: data.charts.marketShare }],
      };
    }
  }
}
