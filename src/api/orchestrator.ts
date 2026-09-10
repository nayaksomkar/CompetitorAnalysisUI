// =============================================================================
// Orchestrator Client — Testing endpoints for parser → orchestrator → UI flow
//
// Two endpoints:
//   1. SEND: POST /api/v1/orchestrator/send  — Send data/requests to orchestrator
//   2. RECEIVE: GET /api/v1/orchestrator/receive — Receive processed response
//
// Supports localhost and Render host for testing.
// =============================================================================

import type { AnalysisData, BusinessProfile, ChatAsset } from '../types';
import { getActiveBaseUrl } from '../components/EndpointSettings';

export interface OrchestratorSendRequest {
  profile: BusinessProfile;
  sample_id?: string;
  user_query?: string;
  context?: AnalysisData;
}

export interface OrchestratorSendResponse {
  status: 'accepted' | 'processing' | 'error';
  job_id: string;
  message: string;
  estimated_time_ms?: number;
}

export interface OrchestratorReceiveResponse {
  status: 'completed' | 'processing' | 'failed' | 'not_found';
  job_id: string;
  result?: {
    text: string;
    assets: ChatAsset[];
    data?: AnalysisData;
  };
  error?: string;
  progress?: number;
}

export class OrchestratorClient {
  private getBaseUrl(): string {
    return getActiveBaseUrl();
  }

  /**
   * SEND endpoint — Send data/requests to the orchestrator for processing
   * POST /api/v1/orchestrator/send
   */
  async send(req: OrchestratorSendRequest): Promise<OrchestratorSendResponse> {
    const baseUrl = this.getBaseUrl();
    const response = await fetch(`${baseUrl}/api/v1/orchestrator/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        profile: req.profile,
        sample_id: req.sample_id,
        user_query: req.user_query,
        context: req.context,
      }),
    });

    if (!response.ok) {
      throw new Error(`Orchestrator send failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * RECEIVE endpoint — Receive the orchestrator's processed response
   * GET /api/v1/orchestrator/receive?job_id=xxx
   */
  async receive(jobId: string): Promise<OrchestratorReceiveResponse> {
    const baseUrl = this.getBaseUrl();
    const response = await fetch(
      `${baseUrl}/api/v1/orchestrator/receive?job_id=${encodeURIComponent(jobId)}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      }
    );

    if (!response.ok) {
      throw new Error(`Orchestrator receive failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * POLL endpoint — Poll until job completes (with timeout)
   */
  async pollUntilComplete(
    jobId: string,
    options: { maxAttempts?: number; intervalMs?: number; onProgress?: (progress: number) => void } = {}
  ): Promise<OrchestratorReceiveResponse> {
    const { maxAttempts = 30, intervalMs = 2000, onProgress } = options;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const result = await this.receive(jobId);

      if (result.status === 'completed' || result.status === 'failed') {
        return result;
      }

      if (result.progress !== undefined && onProgress) {
        onProgress(result.progress);
      }

      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }

    throw new Error(`Polling timed out after ${maxAttempts} attempts for job ${jobId}`);
  }

  /**
   * HEALTH endpoint — Check if orchestrator is reachable
   * GET /health
   */
  async health(): Promise<boolean> {
    try {
      const baseUrl = this.getBaseUrl();
      const response = await fetch(`${baseUrl}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

// Singleton instance
export const orchestrator = new OrchestratorClient();
