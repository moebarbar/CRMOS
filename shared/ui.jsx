// Shared UI primitives for CRMOS marketing + dashboard

const Logo = ({ size = 22, withWord = true }) => (
  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 9 }}>
    <svg width={size} height={size} viewBox="0 0 32 32">
      <defs>
        <linearGradient id="lg-logo" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--lime-bright)" />
          <stop offset="1" stopColor="var(--lime-dim)" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="28" height="28" rx="7" fill="var(--lime)" />
      <path d="M 9 22 L 9 10 L 13 10 L 16 16 L 19 10 L 23 10 L 23 22" stroke="#06170a" strokeWidth="2.6" fill="none" strokeLinecap="square" strokeLinejoin="miter" />
      <circle cx="16" cy="22" r="1.6" fill="#06170a" />
    </svg>
    {withWord && (
      <span style={{ fontWeight: 700, letterSpacing: '-0.02em', fontSize: size * 0.78 }}>CRMOS</span>
    )}
  </div>
);

const Avatar = ({ name, size = 28, color }) => {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const colors = ['#c4f048', '#60a5fa', '#f59e0b', '#a78bfa', '#fb7185', '#34d399', '#fbbf24'];
  const bg = color || colors[name.charCodeAt(0) % colors.length];
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: bg, color: '#06170a',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.38, fontWeight: 600, flexShrink: 0,
      fontFamily: 'var(--font-sans)', letterSpacing: '-0.01em'
    }}>{initials}</div>
  );
};

// Tiny icon set — stroke icons matching the brand
const Icon = ({ name, size = 16, stroke = 'currentColor', fill = 'none', strokeWidth = 1.6 }) => {
  const s = size;
  const common = { width: s, height: s, viewBox: '0 0 24 24', fill, stroke, strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round' };
  const paths = {
    home: <><path d="M3 11l9-8 9 8" /><path d="M5 10v10h14V10" /></>,
    inbox: <><path d="M3 12h6l2 3h2l2-3h6" /><path d="M3 12V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6" /><path d="M3 12v6a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-6" /></>,
    pipeline: <><rect x="3" y="4" width="5" height="16" rx="1" /><rect x="10" y="4" width="5" height="11" rx="1" /><rect x="17" y="4" width="4" height="7" rx="1" /></>,
    proposal: <><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" /><polyline points="14 3 14 9 20 9" /><path d="M8 13h8M8 17h5" /></>,
    contract: <><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" /><path d="M14 3v6h6" /><path d="M9 17c1.5-1 3-2 5-2s3 1 4 2" /></>,
    invoice: <><path d="M5 3h14v18l-3-2-2 2-2-2-2 2-2-2-3 2z" /><path d="M9 8h6M9 12h6M9 16h4" /></>,
    project: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
    time: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 9h18M8 3v4M16 3v4" /></>,
    form: <><rect x="4" y="4" width="16" height="16" rx="2" /><path d="M8 9h8M8 13h8M8 17h5" /></>,
    portal: <><path d="M3 21h18" /><path d="M5 21V8l7-5 7 5v13" /><path d="M10 21v-6h4v6" /></>,
    bolt: <><path d="M13 2L4 14h7l-1 8 9-12h-7z" /></>,
    moe: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="4" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    chevron: <><path d="M6 9l6 6 6-6" /></>,
    chevronR: <><path d="M9 6l6 6-6 6" /></>,
    arrow: <><path d="M5 12h14M13 5l7 7-7 7" /></>,
    check: <><path d="M5 13l4 4L19 7" /></>,
    x: <><path d="M6 6l12 12M18 6L6 18" /></>,
    mic: <><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></>,
    bell: <><path d="M6 8a6 6 0 0 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9z" /><path d="M10 21a2 2 0 0 0 4 0" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" /></>,
    user: <><circle cx="12" cy="8" r="4" /><path d="M4 21c1-4 4-6 8-6s7 2 8 6" /></>,
    users: <><circle cx="9" cy="8" r="4" /><path d="M2 21c1-4 3-6 7-6s6 2 7 6" /><circle cx="17" cy="9" r="3" /><path d="M22 19c-.5-2.5-2-4-5-4" /></>,
    money: <><circle cx="12" cy="12" r="9" /><path d="M9 14c0 1.5 1.3 2.5 3 2.5s3-1 3-2.5-1.3-2-3-2-3-.5-3-2 1.3-2.5 3-2.5 3 1 3 2.5M12 6v12" /></>,
    file: <><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" /><path d="M14 3v6h6" /></>,
    play: <><polygon points="6 4 20 12 6 20 6 4" /></>,
    pause: <><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></>,
    star: <><polygon points="12 2 15 9 22 10 17 15 18 22 12 18 6 22 7 15 2 10 9 9" /></>,
    git: <><circle cx="6" cy="6" r="2" /><circle cx="6" cy="18" r="2" /><circle cx="18" cy="12" r="2" /><path d="M6 8v8M8 18a6 6 0 0 0 6-6V8a2 2 0 0 1 2-2" /></>,
    globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></>,
    arrowDown: <><path d="M12 5v14M5 12l7 7 7-7" /></>,
    arrowUp: <><path d="M12 19V5M5 12l7-7 7 7" /></>,
    sparkle: <><path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z" /><path d="M19 16l.7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7z" /></>,
    eye: <><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></>,
    link: <><path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1" /><path d="M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" /></>,
    flag: <><path d="M4 22V4M4 4h13l-2 4 2 4H4" /></>,
    workflow: <><circle cx="5" cy="6" r="2" /><circle cx="19" cy="6" r="2" /><circle cx="5" cy="18" r="2" /><circle cx="19" cy="18" r="2" /><path d="M7 6h10M7 18h10M5 8v8M19 8v8" /></>,
    template: <><rect x="3" y="3" width="18" height="6" rx="1" /><rect x="3" y="11" width="8" height="10" rx="1" /><rect x="13" y="11" width="8" height="10" rx="1" /></>,
    filter: <><path d="M3 5h18l-7 9v6l-4-2v-4z" /></>,
    sort: <><path d="M3 6h13M3 12h9M3 18h5" /><path d="M18 9l3-3 3 3M21 6v15" /></>,
    more: <><circle cx="6" cy="12" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="18" cy="12" r="1.5" /></>,
    download: <><path d="M12 3v12M6 11l6 6 6-6M4 21h16" /></>,
    upload: <><path d="M12 21V9M6 13l6-6 6 6M4 3h16" /></>,
    send: <><path d="M22 2L11 13M22 2l-7 20-4-9-9-4z" /></>,
    paperclip: <><path d="M21 11l-9 9a5 5 0 0 1-7-7l9-9a3 3 0 0 1 4 4l-9 9a1.5 1.5 0 0 1-2-2l8-8" /></>,
    phone: <><path d="M22 16v3a2 2 0 0 1-2 2A18 18 0 0 1 3 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3l-2 1a14 14 0 0 0 6 6l1-2h3a2 2 0 0 1 2 2z" /></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 7 9-7" /></>,
    chat: <><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></>,
    sms: <><path d="M21 11a8 8 0 0 1-12 7l-6 2 2-5a8 8 0 1 1 16-4z" /></>,
    sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5" /></>,
    moon: <><path d="M21 13A9 9 0 1 1 11 3a7 7 0 0 0 10 10z" /></>,
    lock: <><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></>,
    drag: <><circle cx="9" cy="6" r="1" /><circle cx="15" cy="6" r="1" /><circle cx="9" cy="12" r="1" /><circle cx="15" cy="12" r="1" /><circle cx="9" cy="18" r="1" /><circle cx="15" cy="18" r="1" /></>,
    layout: <><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" /></>,
    list: <><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" /></>,
    table: <><rect x="3" y="3" width="18" height="18" rx="1" /><path d="M3 9h18M3 15h18M9 3v18M15 3v18" /></>,
    gantt: <><path d="M3 6h8M3 12h12M3 18h6" stroke={stroke} strokeWidth="3" /></>,
    alert: <><circle cx="12" cy="12" r="9" /><path d="M12 8v4M12 16h.01" /></>,
  };
  return <svg {...common}>{paths[name] || paths.moe}</svg>;
};

window.Logo = Logo;
window.Avatar = Avatar;
window.Icon = Icon;
