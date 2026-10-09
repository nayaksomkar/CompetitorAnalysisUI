import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import { getLocalSample } from './data/github-loader';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  localStorage.clear();
});

describe('predefined sample dashboard flow', () => {
  it.each([
    ['Scentra', /Scentra — Premium & niche fragrance/],
    ['ProV Foods', /ProV Foods — Plant-based protein nutrition/],
  ])('opens the %s dashboard using its local sample when GitHub is unavailable', async (businessName, sampleButton) => {
    const requests: string[] = [];
    vi.stubGlobal('fetch', vi.fn((input: RequestInfo | URL) => {
      requests.push(String(input));
      return Promise.reject(new Error('GitHub unavailable'));
    }));

    render(<App />);
    expect(screen.getByRole('contentinfo')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: sampleButton }));
    fireEvent.click(screen.getByRole('button', { name: 'Start analysis' }));

    expect(await screen.findByRole('heading', { name: `${businessName} — Overview` })).toBeTruthy();
    expect(screen.queryByRole('contentinfo')).toBeNull();
    await waitFor(() => expect(requests.length).toBeGreaterThan(0));
    expect(requests.every((url) => url.startsWith('https://raw.githubusercontent.com/'))).toBe(true);
    expect(requests.some((url) => url.includes('/health') || url.includes('/api/v1/'))).toBe(false);
  });

  it('refreshes a selected sample from GitHub when the remote dataset is available', async () => {
    const sample = getLocalSample('perfume');
    if (!sample) throw new Error('Bundled Scentra sample was incomplete.');
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(sample), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Start analysis' }));

    expect(await screen.findByRole('heading', { name: 'Scentra — Overview' })).toBeTruthy();
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(String(fetchMock.mock.calls[0][0])).toBe('https://raw.githubusercontent.com/nayaksomkar/CompetitorAnalysisUI/main/data/perfume.json');
  });
});
