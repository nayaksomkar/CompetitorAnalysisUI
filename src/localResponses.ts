import type { AnalysisData, ChatAsset } from './types';

const SUGGESTIONS = [
  'Give me an overview',
  'Show me a SWOT for the biggest threat',
  'Compare pricing across the top competitors',
  'Where are the biggest market gaps?',
  'Recommend an action plan',
  'Show me a chart of market share',
] as const;

export type Suggestion = (typeof SUGGESTIONS)[number];

export function isSuggestion(text: string): text is Suggestion {
  return (SUGGESTIONS as readonly string[]).includes(text);
}

/**
 * Build a data-driven chat response for a predefined question.
 * Reads from the existing AnalysisData so the answer is instant — no
 * orchestrator round-trip. The response is rendered with a typing
 * animation by the chat UI.
 */
export function getLocalResponse(suggestion: Suggestion, data: AnalysisData): { text: string; assets: ChatAsset[] } {
  switch (suggestion) {
    case 'Give me an overview':
      return {
        text: `Here's the competitive overview for ${data.businessName}. You're competing against ${data.competitors.length} key players in ${data.industry}. Scroll through the sections below — and ask me anything about it.`,
        assets: [{ kind: 'dashboard', data }],
      };

    case 'Show me a SWOT for the biggest threat': {
      const threat = data.competitors
        .filter((c) => c.marketPosition === 'Leader' || c.marketPosition === 'Challenger')
        .sort((a, b) => (b.marketShare ?? 0) - (a.marketShare ?? 0))[0]
        ?? data.competitors.slice(
          0,
          data.competitors.length,
        ).sort((a, b) => (b.marketShare ?? 0) - (a.marketShare ?? 0))[0];

      if (!threat) {
        return { text: 'No competitor data available.', assets: [] };
      }

      return {
        text: `**${threat.name}** is the biggest threat — they hold a ${threat.marketShare ?? 'significant'}% ${threat.marketShare ? 'market share' : ''} position as a ${threat.marketPosition ?? 'competitive'} player. Here's their full SWOT:`,
        assets: [{ kind: 'swot', data: { competitorId: threat.id, swot: threat.swot, competitorName: threat.name } }],
      };
    }

    case 'Compare pricing across the top competitors': {
      const competitorNames = data.pricingTiers
        .map((t) => data.competitors.find((c) => c.id === t.competitorId)?.name)
        .filter(Boolean)
        .slice(0, 4);
      const tierCount = data.pricingTiers.length;
      const uniqueCompetitors = new Set(data.pricingTiers.map((t) => t.competitorId)).size;

      const nameList = competitorNames.length > 1
        ? competitorNames.slice(0, -1).join(', ') + ' and ' + competitorNames[competitorNames.length - 1]
        : competitorNames.join('');

      const tierLabel = tierCount === 1 ? 'tier' : 'tiers';
      const compLabel = uniqueCompetitors === 1 ? 'competitor' : 'competitors';

      const text = `Here's how **${data.businessName}** compares to ${nameList} on pricing. ${tierCount} ${tierLabel} across ${uniqueCompetitors} ${compLabel} — toggle monthly / yearly to see effective costs.`;

      return {
        text,
        assets: [{ kind: 'pricing-table', data: { title: 'Pricing Comparison', tiers: data.pricingTiers } }],
      };
    }

    case 'Where are the biggest market gaps?': {
      const top = [...data.marketGaps].sort((a, b) => b.opportunityScore - a.opportunityScore).slice(0, 3);
      const names = top.map((g) => g.title).join(', ');

      const text = top.length > 0
        ? `The biggest gaps in ${data.industry}: **${names}**. Ranked by opportunity score (market demand vs. entrenched supply). Gap #1 scores ${top[0].opportunityScore}/100 with an estimated ${top[0].estimatedRevenue ?? 'N/A'} revenue opportunity.`
        : 'No market gap data available for this analysis.';

      return {
        text,
        assets: [...data.marketGaps]
          .sort((a, b) => b.opportunityScore - a.opportunityScore)
          .slice(0, 5)
          .map((g) => ({ kind: 'market-gap' as const, data: g })),
      };
    }

    case 'Recommend an action plan': {
      const p0 = data.actionPlan.filter((a) => a.priority === 'P0');
      const count = data.actionPlan.length;

      let text: string;
      if (count > 0) {
        const p0Note = p0.length > 0
          ? ` starting with ${p0.length} P0 priority item${p0.length === 1 ? '' : 's'}`
          : '';
        text = `Here's a ${count}-step action plan${p0Note}. Items are sequenced by effort vs. impact — quick wins first, strategic bets later. Tap any step for the full rationale.`;
      } else {
        text = 'No action plan data available.';
      }

      return {
        text,
        assets: [{ kind: 'action-plan', data: { title: 'Recommended Action Plan', items: data.actionPlan } }],
      };
    }

    case 'Show me a chart of market share': {
      const sorted = [...data.competitors].sort((a, b) => (b.marketShare ?? 0) - (a.marketShare ?? 0));
      const leader = sorted[0];

      let text: string;
      if (leader?.marketShare) {
        text = `**${leader.name}** leads with ${leader.marketShare}% market share. The full competitive landscape:`;
      } else {
        text = 'Market share breakdown across competitors:';
      }

      return {
        text,
        assets: [{ kind: 'chart', data: data.charts.marketShare }],
      };
    }

    default:
      return { text: 'Here is what I found.', assets: [] };
  }
}
