import { useMemo, type ReactNode } from 'react';

/**
 * Renders backend narrative text safely.
 *
 * The orchestrator sometimes returns summaries, executive summaries, or report
 * bodies that contain raw Markdown or literal HTML. Rendering that text
 * directly into JSX displays the literal markup to the user.
 *
 * This component:
 *  - Strips literal HTML tags (never executes them).
 *  - Renders a small, safe subset of inline Markdown: **bold**, *italic*, `code`,
 *    [text](url) links, and line breaks.
 *  - Does NOT pull in a heavy Markdown library.
 */
export function SafeText({
  text,
  className = '',
  as: Tag = 'p',
}: {
  text?: string | null;
  className?: string;
  as?: 'p' | 'span' | 'div';
}) {
  const nodes = useMemo(() => renderInline(text ?? ''), [text]);
  if (nodes.length === 0) return null;
  return <Tag className={className}>{nodes}</Tag>;
}

function renderInline(text: string): ReactNode[] {
  // Strip literal HTML tags but keep their text content.
  const stripped = text.replace(/<[^>]*>/g, '');
  const parts: ReactNode[] = [];
  let key = 0;
  let remaining = stripped;

  while (remaining.length > 0) {
    // Inline code: `...`
    const codeMatch = remaining.match(/^`([^`]+)`/);
    if (codeMatch) {
      parts.push(<code key={`code-${key++}`} className="rounded bg-ink-100 px-1 py-0.5 text-xs font-mono text-ink-800">{codeMatch[1]}</code>);
      remaining = remaining.slice(codeMatch[0].length);
      continue;
    }

    // Bold: **...**
    const boldMatch = remaining.match(/^\*\*([^*]+)\*\*/);
    if (boldMatch) {
      parts.push(<strong key={`bold-${key++}`} className="font-semibold text-ink-900">{boldMatch[1]}</strong>);
      remaining = remaining.slice(boldMatch[0].length);
      continue;
    }

    // Italic: *...*
    const italicMatch = remaining.match(/^\*([^*]+)\*/);
    if (italicMatch) {
      parts.push(<em key={`italic-${key++}`} className="italic text-ink-700">{italicMatch[1]}</em>);
      remaining = remaining.slice(italicMatch[0].length);
      continue;
    }

    // Link: [text](url)
    const linkMatch = remaining.match(/^\[([^\]]+)\]\(([^)]+)\)/);
    if (linkMatch) {
      parts.push(
        <a key={`link-${key++}`} href={linkMatch[2]} target="_blank" rel="noreferrer" className="text-emerald-700 hover:underline">
          {linkMatch[1]}
        </a>,
      );
      remaining = remaining.slice(linkMatch[0].length);
      continue;
    }

    // Plain text up to the next special character.
    const nextSpecial = remaining.search(/[`*\[]/);
    if (nextSpecial === -1) {
      parts.push(<span key={`txt-${key++}`}>{remaining}</span>);
      break;
    }
    if (nextSpecial > 0) {
      parts.push(<span key={`txt-${key++}`}>{remaining.slice(0, nextSpecial)}</span>);
    }
    remaining = remaining.slice(nextSpecial);
  }

  return parts;
}