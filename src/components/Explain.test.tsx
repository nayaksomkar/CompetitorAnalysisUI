import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ExplainButton, ExplainPanelProvider } from './Explain';

describe('Explain This panel', () => {
  it('keeps the contextual explanation and Sources without follow-up actions', () => {
    render(
      <ExplainPanelProvider>
        <ExplainButton
          context={{ section: 'competitor', title: 'Pricing position', entity: 'Example Co.' }}
          explanation={{
            summary: 'Prices are positioned above the market average.',
            whyItMatters: ['This may affect conversion.'],
            evidence: [],
            sources: [{ id: 'source-1', title: 'Pricing report', url: 'https://example.com/report' }],
          }}
        />
      </ExplainPanelProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Explain this' }));

    expect(screen.getByRole('dialog', { name: 'Explain Pricing position' })).toBeTruthy();
    expect(screen.getByText('Prices are positioned above the market average.')).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Sources' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Pricing report' })).toHaveProperty('href', 'https://example.com/report');
    expect(screen.queryByText('Explore further')).toBeNull();
    expect(screen.queryByRole('button', { name: /Compare with|price gaps|premium positioning|Show sources/i })).toBeNull();
  });
});
