import type { ActionId, ContextualAction } from '../actions';
import { isActionId } from '../actions';
import { getActiveBaseUrl } from '../components/EndpointSettings';
import { samples, type SampleId } from '../data';
import type { AnalysisData, BusinessProfile, OrchestratorResponse } from '../types';

export interface ActionResult {
  response: OrchestratorResponse;
}

export interface ApiClient {
  bootstrap(profile: BusinessProfile, sampleId: SampleId): Promise<AnalysisData>;
  executeAction(action: ContextualAction, data: AnalysisData): Promise<ActionResult>;
}

class OrchestratorApi implements ApiClient {
  async bootstrap(profile: BusinessProfile, sampleId: SampleId): Promise<AnalysisData> {
    const base = samples[sampleId];
    return { ...base, profile: { ...base.profile, ...profile } };
  }

  async executeAction(action: ContextualAction, data: AnalysisData): Promise<ActionResult> {
    if (!isActionId(action.action)) {
      throw new Error('Unsupported action.');
    }
    if (!action.entity.trim()) {
      throw new Error('An action requires a selected entity.');
    }
    if (action.action === 'compare_competitors' && !action.target?.trim()) {
      throw new Error('Choose a competitor to compare.');
    }

    const structuredAction: { action: ActionId; entity: string; section: ContextualAction['section']; target?: string } = {
      action: action.action,
      entity: action.entity,
      section: action.section,
      ...(action.target ? { target: action.target } : {}),
    };
    const intent = action.action === 'compare_competitors'
      ? 'compare'
      : action.action.startsWith('explain_')
        ? 'explain'
        : 'question';

    const response = await fetch(`${getActiveBaseUrl()}/api/v1/parser/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        parser_input: {
          intent,
          action: structuredAction,
          session_id: `ui-${crypto.randomUUID()}`,
          context_update: {
            version: 1,
            business: {
              name: data.profile.businessName,
              industry: data.profile.industry,
              pricing: data.profile.pricing,
              model: data.profile.businessModel,
              idea: data.profile.idea,
            },
            entities: {
              competitors: data.competitors.map((competitor) => competitor.id),
              focus: action.entity,
            },
            result_meta: {
              requested_count: data.competitors.length,
              retrieved_count: data.competitors.length,
              filters: [],
            },
            constraints: { included: [], excluded: [] },
            keywords: [data.profile.industry],
          },
          current_analysis: {
            business: {
              name: data.profile.businessName,
              industry: data.profile.industry,
              pricing: data.profile.pricing,
              model: data.profile.businessModel,
              idea: data.profile.idea,
            },
            competitors: data.competitors,
            pricingTiers: data.pricingTiers,
            marketGaps: data.marketGaps,
            insights: data.insights,
            charts: data.charts,
            sources: data.sources,
          },
          form_input: {
            business_name: data.profile.businessName,
            idea: data.profile.idea,
            industry: data.profile.industry,
          },
        },
      }),
      signal: AbortSignal.timeout(100000),
    });

    if (!response.ok) {
      const details = await response.text();
      throw new Error(`Orchestrator returned ${response.status}${details ? `: ${details.slice(0, 200)}` : ''}`);
    }

    const payload: unknown = await response.json();
    if (!isOrchestratorResponse(payload)) {
      throw new Error('The orchestrator returned an invalid action response.');
    }
    if (payload.status === 'error') {
      throw new Error(payload.error ?? 'The orchestrator could not complete this action.');
    }
    return { response: payload };
  }
}

function isOrchestratorResponse(value: unknown): value is OrchestratorResponse {
  return typeof value === 'object'
    && value !== null
    && 'status' in value
    && (value.status === 'success' || value.status === 'partial' || value.status === 'error');
}

export const api: ApiClient = new OrchestratorApi();
