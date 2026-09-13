import { useEffect, type ReactNode } from 'react';

export interface ContextMenuOption {
  id: string;
  label: string;
  icon?: ReactNode;
  onClick: () => void;
}

export function ContextMenu({
  x,
  y,
  options,
  onClose,
}: {
  x: number;
  y: number;
  options: ContextMenuOption[];
  onClose: () => void;
}) {
  useEffect(() => {
  const onDocClick = (e: MouseEvent) => {
  const target = e.target as HTMLElement;
  if (!target.closest('[data-context-menu]')) onClose();
  };
  const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
  document.addEventListener('mousedown', onDocClick);
  document.addEventListener('keydown', onKey);
  return () => {
  document.removeEventListener('mousedown', onDocClick);
  document.removeEventListener('keydown', onKey);
  };
  }, [onClose]);

  // Clamp to viewport
  const vw = typeof window !== 'undefined' ? window.innerWidth : 800;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 600;
  const menuW = 240;
  const optionH = 40;
  const menuH = options.length * optionH + 8;
  const left = Math.min(x, vw - menuW - 8);
  const top = Math.min(y, vh - menuH - 8);

  return (
  <div
  data-context-menu
  className="fixed z-[100] w-60 card bg-white  border border-ink-200  shadow-lg rounded-xl overflow-hidden py-1"
  style={{ left: Math.max(8, left), top: Math.max(8, top) }}
  >
  {options.map((opt) => (
  <button
  key={opt.id}
  onClick={() => { opt.onClick(); onClose(); }}
  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-left text-ink-700  hover:bg-ink-50 transition-colors"
  >
  {opt.icon && <span className="w-4 h-4 shrink-0 text-ink-500  [&>svg]:w-4 [&>svg]:h-4">{opt.icon}</span>}
  <span className="truncate">{opt.label}</span>
  </button>
  ))}
  </div>
  );
}
