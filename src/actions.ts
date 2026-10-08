import type { AnalysisData, Explanation } from './types';

export type ExplainSection =
  | 'competitor'
  | 'pricing'
  | 'market-gap'
  | 'insight'
  | 'chart'
  | 'product'
  | 'report'
  | 'sources';

export const ACTION_REGISTRY = {
  explain_context: { label: 'Explain this section' },
  show_pricing: { label: 'Show pricing' },
  show_market_position: { label: 'Show market position' },
  show_weaknesses: { label: 'Show weaknesses' },
  show_strengths: { label: 'Show strengths' },
  show_sources: { label: 'Show sources' },
  compare_competitors: { label: 'Compare with' },
  show_market_share: { label: 'Show market share' },
  show_growth: { label: 'Show growth' },
  show_market_gap: { label: 'Show market gap' },
  show_supporting_data: { label: 'Show supporting data' },
  explain_trend: { label: 'Explain this trend' },
  show_price_gaps: { label: 'Show price gaps' },
  explain_premium_positioning: { label: 'Explain premium positioning' },
  show_affected_competitors: { label: 'Show affected competitors' },
  explain_opportunity: { label: 'Explain this opportunity' },
  show_supporting_evidence: { label: 'Show supporting evidence' },
  explore_related_products: { label: 'Explore related products' },
  explore_implications: { label: 'Explore implications' },
  show_underlying_data: { label: 'Show underlying data' },
} as const;

export type ActionId = keyof typeof ACTION_REGISTRY;

export interface ContextualAction {
  action: ActionId;
  entity: string;
  section: ExplainSection;
  target?: string;
}

export interface ExplainContext {
  section: ExplainSection;
  title: string;
  entity: string;
  explanation?: Explanation;
}

export interface ActionOption {
  id: ActionId;
  label: string;
  target?: string;
}

const ACTIONS_BY_SECTION: Record<ExplainSection, ActionId[]> = {
  competitor: [
    'show_pricing',
    'show_market_position',
    'show_weaknesses',
    'compare_competitors',
    'show_sources',
  ],
  pricing: [
    'compare_competitors',
    'show_price_gaps',
    'explain_premium_positioning',
    'show_sources',
  ],
  'market-gap': [
    'show_affected_competitors',
    'explain_opportunity',
    'show_supporting_evidence',
    'explore_related_products',
  ],
  insight: [
    'show_supporting_data',
    'show_sources',
    'explore_implications',
    'show_affected_competitors',
  ],
  chart: [
    'explain_trend',
    'show_underlying_data',
    'show_market_share',
    'show_growth',
    'compare_competitors',
    'show_sources',
  ],
  product: ['show_pricing', 'show_strengths', 'show_sources'],
  report: ['show_supporting_data', 'show_sources', 'explore_implications'],
  sources: ['show_supporting_data', 'show_affected_competitors'],
};

export function getContextualActions(
  context: ExplainContext,
  data: AnalysisData,
): ActionOption[] {
  const actions: ActionOption[] = [];
  for (const id of ACTIONS_BY_SECTION[context.section]) {
    const definition = ACTION_REGISTRY[id];
    if (id === 'compare_competitors') {
      const targets = data.competitors.filter((competitor) => competitor.name !== context.entity);
      actions.push(...targets.map((competitor) => ({
        id,
        target: competitor.name,
        label: `${definition.label} ${competitor.name}`,
      })));
    } else {
      actions.push({ id, label: definition.label });
    }
  }
  return actions;
}

export function isActionId(value: unknown): value is ActionId {
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(ACTION_REGISTRY, value);
}
