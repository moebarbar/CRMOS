/** Deterministic-color initials avatar. Ported from shared/ui.jsx. */
const COLORS = ['#c4f048', '#60a5fa', '#f59e0b', '#a78bfa', '#fb7185', '#34d399', '#fbbf24'] as const;

export function BrandAvatar({
  name,
  size = 28,
  color,
}: {
  name: string;
  size?: number;
  color?: string;
}) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .filter(Boolean)
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const fallback = COLORS[name.charCodeAt(0) % COLORS.length];
  const bg = color ?? fallback;
  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: bg,
        color: '#06170a',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.38,
        fontWeight: 600,
        flexShrink: 0,
        fontFamily: 'var(--font-sans)',
        letterSpacing: '-0.01em',
      }}
    >
      {initials || '??'}
    </span>
  );
}
