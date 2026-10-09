import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { Footer } from './Footer';

afterEach(cleanup);

describe('Footer', () => {
  it('links to all four repositories and the portfolio with safe new-tab behavior', () => {
    render(<Footer />);

    const destinations = [
      ['CompetitorAnalysisUI', 'https://github.com/nayaksomkar/CompetitorAnalysisUI'],
      ['CompetitorEngine', 'https://github.com/nayaksomkar/CompetitorEngine'],
      ['LLMPing', 'https://github.com/nayaksomkar/LLMPing'],
      ['TotemEngine', 'https://github.com/nayaksomkar/TotemEngine'],
    ];

    for (const [name, href] of destinations) {
      const link = screen.getByRole('link', { name: new RegExp(name) });
      expect(link.getAttribute('href')).toBe(href);
      expect(link.getAttribute('target')).toBe('_blank');
      expect(link.getAttribute('rel')).toBe('noopener noreferrer');
    }

    const portfolio = screen.getByRole('link', { name: /Nayak Omkar.*portfolio/ });
    expect(portfolio.getAttribute('href')).toBe('https://nayaksomkar.vercel.app/');
    expect(portfolio.getAttribute('target')).toBe('_blank');
    expect(portfolio.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('uses a responsive grid that stacks repository cards on small screens', () => {
    render(<Footer />);
    const navigation = screen.getAllByRole('navigation', { name: 'Project repositories' })[0];
    expect(navigation.classList.contains('grid-cols-1')).toBe(true);
    expect(navigation.classList.contains('sm:grid-cols-2')).toBe(true);
    expect(navigation.classList.contains('lg:grid-cols-4')).toBe(true);
  });
});
