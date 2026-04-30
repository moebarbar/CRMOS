'use client';

import * as React from 'react';

export type MoeState = 'idle' | 'listening' | 'thinking' | 'speaking';

export interface MoeIconProps {
  size?: number;
  state?: MoeState;
  accent?: string;
}

/**
 * Moe — agentic AI face icon. Theme-aware face color, high-contrast
 * eyes, expressive states. Pupils always drift. Halo always rotates.
 * Ported verbatim from shared/MoeIcon.jsx.
 */
export function MoeIcon({
  size = 48,
  state = 'idle',
  accent = 'var(--lime)',
}: MoeIconProps) {
  const id = React.useId();
  const [blink, setBlink] = React.useState(false);
  const [pupil, setPupil] = React.useState({ x: 0, y: 0 });

  React.useEffect(() => {
    const blinkT = setInterval(
      () => {
        setBlink(true);
        setTimeout(() => setBlink(false), 140);
      },
      3500 + Math.random() * 2000,
    );
    return () => clearInterval(blinkT);
  }, []);

  // Pupils always drift — "looking around" feels alive.
  React.useEffect(() => {
    const isThinkingNow = state === 'thinking';
    const range = isThinkingNow ? { x: 5, y: 3 } : { x: 2.2, y: 1.4 };
    const interval = isThinkingNow ? 800 : 1800 + Math.random() * 1200;
    const t = setInterval(() => {
      setPupil({
        x: (Math.random() - 0.5) * range.x * 2,
        y: (Math.random() - 0.5) * range.y * 2,
      });
    }, interval);
    const first = setTimeout(
      () => {
        setPupil({
          x: (Math.random() - 0.5) * range.x * 2,
          y: (Math.random() - 0.5) * range.y * 2,
        });
      },
      400 + Math.random() * 800,
    );
    return () => {
      clearInterval(t);
      clearTimeout(first);
    };
  }, [state]);

  const eyeR = 5.5;
  const isListening = state === 'listening';
  const isSpeaking = state === 'speaking';
  const isThinking = state === 'thinking';

  const faceTop = `color-mix(in oklab, ${accent} 92%, white 10%)`;
  const faceBot = `color-mix(in oklab, ${accent} 78%, black 18%)`;
  const faceStroke = `color-mix(in oklab, ${accent} 60%, black 30%)`;
  const eyeWhite = '#ffffff';
  const eyeRing = `color-mix(in oklab, ${accent} 30%, white 60%)`;
  const pupilDark = `color-mix(in oklab, ${accent} 35%, #050810 70%)`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      style={{ display: 'block', overflow: 'visible' }}
      aria-hidden
    >
      <defs>
        <linearGradient id={`${id}-face`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={faceTop} />
          <stop offset="100%" stopColor={faceBot} />
        </linearGradient>
        <linearGradient id={`${id}-shine`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.35)" />
          <stop offset="50%" stopColor="rgba(255,255,255,0.05)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
        <radialGradient id={`${id}-cheek`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.25)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
      </defs>

      <circle
        cx="32"
        cy="33"
        r="29"
        fill="none"
        stroke={accent}
        strokeWidth="1"
        opacity={isListening || isSpeaking ? 0.55 : isThinking ? 0.4 : 0.28}
        strokeDasharray={isThinking ? '2 5' : '3 4'}
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 32 33"
          to="360 32 33"
          dur={isListening || isSpeaking ? '6s' : isThinking ? '4s' : '10s'}
          repeatCount="indefinite"
        />
      </circle>

      <line
        x1="32"
        y1="6"
        x2="32"
        y2="12"
        stroke={faceStroke}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx="32" cy="5" r="2.2" fill={accent} stroke={eyeWhite} strokeWidth="0.8">
        <animate attributeName="r" values="1.8;2.6;1.8" dur="2s" repeatCount="indefinite" />
      </circle>

      <rect
        x="10"
        y="12"
        width="44"
        height="42"
        rx="14"
        fill={`url(#${id}-face)`}
        stroke={faceStroke}
        strokeWidth="1.2"
      />
      <rect x="10" y="12" width="44" height="22" rx="14" fill={`url(#${id}-shine)`} />

      <rect x="8" y="24" width="3" height="6" rx="1.2" fill={faceStroke} opacity="0.7" />
      <rect x="8" y="32" width="3" height="4" rx="1.2" fill={faceStroke} opacity="0.5" />
      <rect x="53" y="24" width="3" height="6" rx="1.2" fill={faceStroke} opacity="0.7" />
      <rect x="53" y="32" width="3" height="4" rx="1.2" fill={faceStroke} opacity="0.5" />

      <circle cx="18" cy="42" r="4" fill={`url(#${id}-cheek)`} />
      <circle cx="46" cy="42" r="4" fill={`url(#${id}-cheek)`} />

      <path
        d={isThinking ? 'M 19 25 Q 23 22 28 24' : 'M 19 26 L 28 26'}
        stroke={faceStroke}
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d={isThinking ? 'M 36 24 Q 41 22 45 25' : 'M 36 26 L 45 26'}
        stroke={faceStroke}
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />

      <g>
        <ellipse
          cx="24"
          cy={34}
          rx={eyeR}
          ry={blink ? 0.6 : eyeR}
          fill={eyeWhite}
          stroke={eyeRing}
          strokeWidth="0.6"
        />
        <circle
          cx={24 + pupil.x}
          cy={34 + pupil.y}
          r="2.6"
          fill={pupilDark}
          opacity={blink ? 0 : 1}
        />
        <circle
          cx={24 + pupil.x - 0.9}
          cy={34 + pupil.y - 1}
          r="0.9"
          fill={eyeWhite}
          opacity={blink ? 0 : 1}
        />

        <ellipse
          cx="40"
          cy={34}
          rx={eyeR}
          ry={blink ? 0.6 : eyeR}
          fill={eyeWhite}
          stroke={eyeRing}
          strokeWidth="0.6"
        />
        <circle
          cx={40 + pupil.x}
          cy={34 + pupil.y}
          r="2.6"
          fill={pupilDark}
          opacity={blink ? 0 : 1}
        />
        <circle
          cx={40 + pupil.x - 0.9}
          cy={34 + pupil.y - 1}
          r="0.9"
          fill={eyeWhite}
          opacity={blink ? 0 : 1}
        />
      </g>

      {isSpeaking ? (
        <g transform="translate(32 46)">
          {[-8, -4, 0, 4, 8].map((x, i) => (
            <rect key={i} x={x - 0.9} y="-3" width="1.8" height="6" rx="0.9" fill={eyeWhite}>
              <animate
                attributeName="height"
                values={`2;${4 + (i % 2) * 3};2`}
                dur={`${0.5 + i * 0.07}s`}
                repeatCount="indefinite"
                begin={`${i * 0.05}s`}
              />
              <animate
                attributeName="y"
                values={`-1;-${(4 + (i % 2) * 3) / 2};-1`}
                dur={`${0.5 + i * 0.07}s`}
                repeatCount="indefinite"
                begin={`${i * 0.05}s`}
              />
            </rect>
          ))}
        </g>
      ) : isThinking ? (
        <g transform="translate(32 46)">
          {[-6, 0, 6].map((x, i) => (
            <circle key={i} cx={x} cy="0" r="1.5" fill={eyeWhite}>
              <animate
                attributeName="opacity"
                values="0.2;1;0.2"
                dur="1.2s"
                repeatCount="indefinite"
                begin={`${i * 0.2}s`}
              />
            </circle>
          ))}
        </g>
      ) : (
        <path
          d="M 24 44 Q 32 50 40 44"
          stroke={eyeWhite}
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}
