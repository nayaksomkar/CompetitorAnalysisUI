import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Questionnaire } from './Questionnaire';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('dynamic analysis unavailable flow', () => {
  it('warns from Create your own and Cancel leaves the questionnaire unchanged', () => {
    render(<Questionnaire onSubmit={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: 'Create your own (unavailable)' }));

    expect(screen.getByRole('dialog')).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Dynamic analysis unavailable' })).toBeTruthy();
    expect(screen.getByText('Creating a custom business analysis is temporarily unavailable because the backend service is not running. Please select one of the predefined sample analyses to explore the dashboard.')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.getByRole('button', { name: /Scentra — Premium & niche fragrance/ })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Tell me about your business' })).toBeTruthy();
  });

  it('blocks an already-open dynamic form submission without calling its submit handler', () => {
    const onSubmit = vi.fn();
    render(<Questionnaire onSubmit={onSubmit} />);

    fireEvent.change(screen.getAllByRole('textbox')[0], { target: { value: 'Custom business' } });
    fireEvent.click(screen.getByRole('button', { name: 'Start analysis' }));

    expect(screen.getByRole('dialog')).toBeTruthy();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('closes with Escape and the Choose a sample button focuses sample selection', () => {
    render(<Questionnaire onSubmit={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Create your own (unavailable)' }));
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Create your own (unavailable)' }));
    fireEvent.click(screen.getByRole('button', { name: 'Choose a sample' }));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.getByText('Choose how to start').parentElement?.querySelector('[tabindex="-1"]')).toBeTruthy();
  });

  it('vibrates once per opening and applies shake only to the warning dialog', () => {
    const vibrate = vi.fn(() => true);
    vi.stubGlobal('navigator', Object.assign(Object.create(navigator), { vibrate }));
    const { rerender } = render(<Questionnaire onSubmit={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: 'Create your own (unavailable)' }));
    const dialog = screen.getByRole('dialog');
    expect(vibrate).toHaveBeenCalledTimes(1);
    expect(vibrate).toHaveBeenCalledWith(100);
    expect(dialog.classList.contains('animate-warning-shake')).toBe(true);

    rerender(<Questionnaire onSubmit={vi.fn()} />);
    expect(vibrate).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    fireEvent.click(screen.getByRole('button', { name: 'Create your own (unavailable)' }));
    expect(vibrate).toHaveBeenCalledTimes(2);
  });

  it('handles unsupported and throwing vibration APIs without interrupting the warning', () => {
    vi.stubGlobal('navigator', Object.create(navigator));
    const { rerender } = render(<Questionnaire onSubmit={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Create your own (unavailable)' }));
    expect(screen.getByRole('dialog')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    Object.defineProperty(navigator, 'vibrate', { configurable: true, value: () => { throw new Error('blocked'); } });
    rerender(<Questionnaire onSubmit={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Create your own (unavailable)' }));
    expect(screen.getByRole('dialog')).toBeTruthy();
  });
});
