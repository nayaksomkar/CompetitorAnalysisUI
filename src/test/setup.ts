/**
 * Vitest setup — minimal mocks for the browser environment.
 *
 * We deliberately do NOT mock the real backend here. Tests use deterministic
 * fixture payloads injected through the api client so we can verify the UI
 * consumes the documented orchestrator schema correctly.
 */
import { vi } from 'vitest';

// jsdom/happy-dom sometimes lacks matchMedia; stub it so Tailwind/utility
// components that read it do not throw during tests.
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = vi.fn((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(() => false),
  }));
}

// IntersectionObserver is used by some UI primitives.
if (typeof window !== 'undefined' && !window.IntersectionObserver) {
  window.IntersectionObserver = vi.fn(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
    takeRecords: vi.fn(() => []),
  })) as unknown as typeof window.IntersectionObserver;
}