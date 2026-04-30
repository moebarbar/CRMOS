/** CRMOS wordmark + mark. Ported from shared/ui.jsx. */
export function Logo({ size = 22, withWord = true }: { size?: number; withWord?: boolean }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 9 }}>
      <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
        <rect x="2" y="2" width="28" height="28" rx="7" fill="var(--lime)" />
        <path
          d="M 9 22 L 9 10 L 13 10 L 16 16 L 19 10 L 23 10 L 23 22"
          stroke="#06170a"
          strokeWidth="2.6"
          fill="none"
          strokeLinecap="square"
          strokeLinejoin="miter"
        />
        <circle cx="16" cy="22" r="1.6" fill="#06170a" />
      </svg>
      {withWord && (
        <span style={{ fontWeight: 700, letterSpacing: '-0.02em', fontSize: size * 0.78 }}>
          CRMOS
        </span>
      )}
    </span>
  );
}
