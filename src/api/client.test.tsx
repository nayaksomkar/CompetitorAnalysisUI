import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { api } from './client';
import { getLocalSample } from '../data/github-loader';
import { TabContent } from '../views/TabViews';
import type { AnalysisData, BusinessProfile, OrchestratorResponse } from '../types';

const profile: BusinessProfile = {
  businessName: 'RouteNest',
  industry: 'Logistics technology',
  idea: 'A logistics coordination platform.',
  geography: 'India',
};

function bootstrapResponse(data: Record<string, unknown>): OrchestratorResponse {
  return { status: 'partial', data };
}

async function mapResponse(data: Record<string, unknown>): Promise<AnalysisData> {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
    new Response(JSON.stringify(bootstrapResponse(data)), { status: 200 }),
  ));
  return (await api.bootstrap(profile)).data;
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  localStorage.clear();
});

describe('bootstrap response mapping and rendering', () => {
  it('does not promote a Markdown report string into an executive summary', async () => {
    const markdownReport = '# Market landscape\n\n| Competitor | Price |\n| --- | --- |\n| Example | Unknown |';
    const data = await mapResponse({ report: markdownReport });

    expect(data.executiveSummary).toBeUndefined();
    expect(data.reports).toEqual([]);

    render(<TabContent tab="overview" data={data} />);
    expect(screen.queryByText(markdownReport)).toBeNull();
    expect(screen.queryByText(/Market landscape/)).toBeNull();
  });

  it('maps dedicated summaries and only structured report records', async () => {
    const data = await mapResponse({
      executive_summary: 'A dedicated executive summary.',
      business_summary: 'A dedicated business summary.',
      positioning: 'A dedicated positioning statement.',
      report: [
        {
          title: 'Structured report',
          summary: 'Evidence-backed summary.',
          sections: [{ heading: 'Findings', body: 'Observed findings.' }],
        },
        '# Invalid report string',
        { summary: 'Missing a required title.' },
      ],
    });

    expect(data.executiveSummary).toBe('A dedicated executive summary.');
    expect(data.businessSummary).toBe('A dedicated business summary.');
    expect(data.positioning).toBe('A dedicated positioning statement.');
    expect(data.reports).toHaveLength(1);
    expect(data.reports[0]).toMatchObject({
      title: 'Structured report',
      summary: 'Evidence-backed summary.',
      sections: [{ heading: 'Findings', body: 'Observed findings.' }],
    });
  });

  it('keeps empty research arrays visible as placeholders for a partial response', async () => {
    const data = await mapResponse({
      report: '# Unstructured Markdown\n\nNo structured research returned.',
      competitors: [],
      products: [],
      pricing_tiers: [],
      market_gaps: [],
      insights: [],
      recommendations: [],
      reports: [],
      sources: [],
    });

    expect(data.executiveSummary).toBeUndefined();
    expect(data.competitors).toEqual([]);
    expect(data.products).toEqual([]);
    expect(data.pricingTiers).toEqual([]);
    expect(data.marketGaps).toEqual([]);
    expect(data.insights).toEqual([]);
    expect(data.recommendations).toEqual([]);
    expect(data.reports).toEqual([]);
    expect(data.sources).toEqual([]);

    const { rerender } = render(<TabContent tab="competitors" data={data} />);
    expect(screen.getByText('No competitor records are available yet.')).toBeTruthy();
    rerender(<TabContent tab="products" data={data} />);
    expect(screen.getByText('No product records are available yet.')).toBeTruthy();
    rerender(<TabContent tab="pricing" data={data} />);
    expect(screen.getByText('Competitor pricing has not been verified yet.')).toBeTruthy();
    rerender(<TabContent tab="market-gaps" data={data} />);
    expect(screen.getByText('No evidence-backed market gaps are available yet.')).toBeTruthy();
    rerender(<TabContent tab="insights" data={data} />);
    expect(screen.getByText('No insights or recommendations are available yet.')).toBeTruthy();
    rerender(<TabContent tab="reports" data={data} />);
    expect(screen.getByText('No reports or action plans are available yet.')).toBeTruthy();
    rerender(<TabContent tab="sources" data={data} />);
    expect(screen.getByText('No supporting sources were returned.')).toBeTruthy();
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('renders genuine numeric zero separately from missing numeric values', async () => {
    const data = await mapResponse({
      competitors: [
        { name: 'Zero Share', market_share: 0 },
        { name: 'Unknown Share' },
      ],
      products: [
        {
          name: 'Zero Metrics',
          starting_price: 0,
          features: [{ name: 'Zero adoption', adoption: 0 }],
        },
        {
          name: 'Missing Metrics',
          features: [{ name: 'Unknown adoption' }],
        },
      ],
    });

    expect(data.competitors[0].marketShare).toBe(0);
    expect(data.competitors[1].marketShare).toBeUndefined();
    expect(data.products[0].startingPrice).toBe(0);
    expect(data.products[0].features[0].adoption).toBe(0);
    expect(data.products[1].startingPrice).toBeUndefined();
    expect(data.products[1].features[0].adoption).toBeUndefined();

    const { rerender } = render(<TabContent tab="competitors" data={data} />);
    expect(screen.getAllByText('0%').length).toBeGreaterThan(0);
    expect(screen.getAllByText('—').length).toBeGreaterThan(0);

    rerender(<TabContent tab="products" data={data} />);
    expect(screen.getByText('₹0')).toBeTruthy();
    expect(screen.getByText('0%')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Missing Metrics' }));
    expect(screen.getAllByText('No data provided')).toHaveLength(2);
    expect(screen.queryByText('GA', { selector: 'span' })).toBeNull();
  });

  it('continues to load and render both bundled sample datasets', () => {
    for (const sampleId of ['perfume', 'protein'] as const) {
      const data = getLocalSample(sampleId);
      if (!data) throw new Error(`Bundled ${sampleId} sample was incomplete.`);
      expect(data.competitors.length).toBeGreaterThan(0);
      expect(data.products.length).toBeGreaterThan(0);
      expect(data.charts.marketShare.series.length).toBeGreaterThan(0);
      const { unmount } = render(<TabContent tab="overview" data={data} />);
      expect(screen.getByText('Executive Summary')).toBeTruthy();
      unmount();
    }
  });
});
