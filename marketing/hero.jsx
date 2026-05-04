// Landing page for CRMOS — split hero with live Moe demo
const { useState, useEffect, useRef } = React;

// ---------- Hero ----------
const HERO_VARIANTS = ['split', 'terminal', 'editorial'];

const TICKER_LOGOS = [
  'HORIZON',
  'NORTHWIND',
  'CIPHER',
  'OAKLINE',
  'STELLA',
  'KNUDSEN',
  'PARALLEL',
  'FERN & CO',
  'HALSTEAD',
  'BYWATER',
];

const MoeDemo = () => {
  const scripts = [
    {
      cmd: 'invoice acme $4,500 for last week',
      thinking: ['Looking up Acme Corp.', 'Pulling time entries Apr 21–27.', 'Drafting invoice…'],
      result: {
        title: 'Invoice INV-1042 ready',
        body: [
          { k: 'Client', v: 'Acme Corp.' },
          { k: 'Amount', v: '$4,500.00' },
          { k: 'Hours', v: '36.0 (8 entries)' },
          { k: 'Due', v: 'May 11, 2026' },
        ],
        cta: 'Send to ar@acme.com',
      },
    },
    {
      cmd: 'book diego 30 min thursday afternoon',
      thinking: ['Checking calendars.', 'Diego open 2:00–4:30 Thu.', 'Holding 3:00 PM…'],
      result: {
        title: 'Meeting drafted',
        body: [
          { k: 'With', v: 'Diego Vargas' },
          { k: 'When', v: 'Thu Apr 30 · 3:00 PM' },
          { k: 'Where', v: 'Meet (auto)' },
          { k: 'Agenda', v: 'Q2 site relaunch' },
        ],
        cta: 'Send invite',
      },
    },
    {
      cmd: 'show overdue invoices, draft chase emails',
      thinking: ['3 invoices overdue.', '$12,840 total.', 'Drafting personalized chases…'],
      result: {
        title: '3 chases drafted',
        body: [
          { k: 'Northwind', v: '$4,200 · 11d late' },
          { k: 'Stella & Co', v: '$6,400 · 5d late' },
          { k: 'Cipher', v: '$2,240 · 2d late' },
        ],
        cta: 'Review & send all',
      },
    },
  ];

  const [scriptIdx, setScriptIdx] = useState(0);
  const [phase, setPhase] = useState('typing'); // typing → thinking → result
  const [typed, setTyped] = useState('');
  const [thinkIdx, setThinkIdx] = useState(0);
  const cur = scripts[scriptIdx];

  useEffect(() => {
    setTyped('');
    setPhase('typing');
    setThinkIdx(0);
    let i = 0;
    const t = setInterval(() => {
      i++;
      setTyped(cur.cmd.slice(0, i));
      if (i >= cur.cmd.length) {
        clearInterval(t);
        setTimeout(() => setPhase('thinking'), 500);
      }
    }, 38);
    return () => clearInterval(t);
  }, [scriptIdx]);

  useEffect(() => {
    if (phase !== 'thinking') return;
    let i = 0;
    const t = setInterval(() => {
      i++;
      setThinkIdx(i);
      if (i >= cur.thinking.length) {
        clearInterval(t);
        setTimeout(() => setPhase('result'), 600);
      }
    }, 700);
    return () => clearInterval(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'result') return;
    const t = setTimeout(() => setScriptIdx((scriptIdx + 1) % scripts.length), 4200);
    return () => clearTimeout(t);
  }, [phase, scriptIdx]);

  return (
    <div className="moe-demo">
      <div className="moe-demo-chrome">
        <div className="moe-demo-dots">
          <span />
          <span />
          <span />
        </div>
        <div className="moe-demo-title mono">moe · command bar</div>
        <span className="kbd">⌘K</span>
      </div>
      <div className="moe-demo-body">
        <div className="moe-demo-input">
          <MoeIcon
            size={28}
            state={
              phase === 'thinking' ? 'thinking' : phase === 'typing' ? 'listening' : 'speaking'
            }
          />
          <div className="moe-demo-prompt mono">
            {typed}
            {phase === 'typing' && <span className="caret" />}
          </div>
        </div>

        {phase !== 'typing' && (
          <div className="moe-demo-stream">
            {cur.thinking.slice(0, thinkIdx).map((t, i) => (
              <div key={i} className="moe-thought mono">
                <span className="dot" /> {t}
              </div>
            ))}
            {phase === 'thinking' && thinkIdx < cur.thinking.length && (
              <div className="moe-thought mono pending">
                <span className="dot pulse" /> {cur.thinking[thinkIdx]}
              </div>
            )}
          </div>
        )}

        {phase === 'result' && (
          <div className="moe-demo-card">
            <div className="moe-demo-card-header">
              <span className="tag lime mono">READY</span>
              <span style={{ fontWeight: 600 }}>{cur.result.title}</span>
            </div>
            <div className="moe-demo-card-body">
              {cur.result.body.map((row, i) => (
                <div key={i} className="moe-demo-row">
                  <span className="mono">{row.k}</span>
                  <span>{row.v}</span>
                </div>
              ))}
            </div>
            <div className="moe-demo-card-footer">
              <button className="btn primary sm">
                {cur.result.cta} <Icon name="arrow" size={14} />
              </button>
              <button className="btn ghost sm">Edit</button>
            </div>
          </div>
        )}
      </div>
      <div className="moe-demo-suggestions">
        {scripts.map((s, i) => (
          <button
            key={i}
            className={`moe-pill ${i === scriptIdx ? 'active' : ''}`}
            onClick={() => setScriptIdx(i)}
          >
            <span className="mono">try:</span> {s.cmd.slice(0, 28)}…
          </button>
        ))}
      </div>
    </div>
  );
};

const HeroSplit = () => (
  <div className="hero hero-split-wrap">
    <div className="hero hero-split">
      <div className="hero-left">
        <div className="hero-eyebrow">
          <span className="pulse-dot" />
          <span>NEW · Moe v2 · voice-to-action</span>
        </div>
        <h1 className="hero-title" style={{ marginTop: 24 }}>
          Run your whole
          <br />
          business. <span className="highlight">Or tell Moe.</span>
        </h1>
        <p className="hero-sub">
          CRMOS is one app where leads, proposals, contracts, invoices, projects, scheduling, time,
          and client comms live together — and an AI agent named Moe takes voice or text commands
          and just does the work.
        </p>
        <div className="hero-cta">
          <a href="#/signup" className="btn primary lg">
            Start free <Icon name="arrow" size={16} />
          </a>
          <a href="#/product" className="btn lg ghost">
            Watch the demo <Icon name="play" size={14} />
          </a>
        </div>
        <div className="hero-meta mono">
          <span>
            <Icon name="check" size={13} /> 14-day trial
          </span>
          <span>
            <Icon name="check" size={13} /> No card
          </span>
          <span>
            <Icon name="check" size={13} /> Replaces 8–12 tools
          </span>
        </div>
      </div>
      <div className="hero-right">
        <MoeDemo />
      </div>
    </div>
    <div className="hero-stats">
      <div className="hero-stat">
        <div className="hero-stat-num">
          <span className="lime-text">2,400+</span>
        </div>
        <div className="hero-stat-label">teams shipped</div>
      </div>
      <div className="hero-stat">
        <div className="hero-stat-num">$84M</div>
        <div className="hero-stat-label">invoiced via Moe</div>
      </div>
      <div className="hero-stat">
        <div className="hero-stat-num">11.4 hrs</div>
        <div className="hero-stat-label">saved per week, avg.</div>
      </div>
      <div className="hero-stat">
        <div className="hero-stat-num">4.9 ★</div>
        <div className="hero-stat-label">G2 · 312 reviews</div>
      </div>
    </div>
  </div>
);

const HeroTerminal = () => {
  const [lines, setLines] = useState([]);
  const script = [
    { t: '$ moe init', d: 0 },
    { t: '› setting up your business OS…', d: 600, dim: true },
    { t: '✓ pipeline · 0 deals', d: 1100, dim: true },
    { t: '✓ inbox · connected', d: 1300, dim: true },
    { t: '✓ stripe · linked', d: 1500, dim: true },
    { t: '$ moe send proposal "website redesign" to acme', d: 2200 },
    { t: '› drafting from template "Brand site v2"…', d: 3000, dim: true },
    { t: '› pricing: $14,500 · timeline: 8 weeks', d: 3400, dim: true },
    { t: '✓ proposal sent · acme will see it now', d: 3900, lime: true },
    { t: '$ _', d: 4500 },
  ];
  useEffect(() => {
    const timers = script.map((s) => setTimeout(() => setLines((prev) => [...prev, s]), s.d));
    const reset = setTimeout(() => setLines([]), 8000);
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(reset);
    };
  }, [lines.length === 0]);

  return (
    <div className="hero hero-terminal">
      <div className="terminal-window">
        <div className="terminal-bar">
          <span className="terminal-dots">
            <span />
            <span />
            <span />
          </span>
          <span className="mono">moe@crmos:~</span>
        </div>
        <div className="terminal-body mono">
          {lines.map((l, i) => (
            <div key={i} className={`term-line ${l.dim ? 'dim' : ''} ${l.lime ? 'lime' : ''}`}>
              {l.t}
            </div>
          ))}
        </div>
      </div>
      <div className="hero-terminal-overlay">
        <h1 className="hero-title">
          Your business
          <br />
          in <span className="highlight">one command.</span>
        </h1>
        <p className="hero-sub" style={{ maxWidth: 540 }}>
          CRMOS is the first AI-native business OS. Replace HubSpot, Asana, FreshBooks, DocuSign,
          Calendly, and Toggl with one connected system — and just talk to Moe.
        </p>
        <div className="hero-cta">
          <a href="#/signup" className="btn primary lg">
            Start free
          </a>
          <a href="#/product" className="btn lg ghost">
            See how Moe works
          </a>
        </div>
      </div>
    </div>
  );
};

const HeroEditorial = () => (
  <div className="hero hero-editorial">
    <div className="editorial-tag mono">CRMOS · 04.2026 · ISSUE 04</div>
    <h1 className="editorial-title">
      One app.
      <br />
      <span className="highlight">One agent.</span>
      <br />
      <span className="dim-text">Zero tab-switching.</span>
    </h1>
    <p className="editorial-lede">
      The business OS for solo founders, freelancers, micro-agencies, and service SMBs who are tired
      of stitching twelve tools together.
    </p>
    <div className="editorial-grid">
      <div className="editorial-cell">
        <div className="mono dim-text">01</div>
        <h3>Sales pipeline</h3>
        <p>Drag-drop pipeline. Forecast revenue. Won/lost in one click.</p>
      </div>
      <div className="editorial-cell">
        <div className="mono dim-text">02</div>
        <h3>Proposals & contracts</h3>
        <p>Sign auto-converts to contract + project. No re-entry.</p>
      </div>
      <div className="editorial-cell">
        <div className="mono dim-text">03</div>
        <h3>Moe, the agent</h3>
        <p>"Invoice Acme last week's hours." Done in 4 seconds.</p>
      </div>
      <div className="editorial-cell">
        <div className="mono dim-text">04</div>
        <h3>Client portal</h3>
        <p>Branded. Custom domain. Clients see only their stuff.</p>
      </div>
    </div>
    <div className="hero-cta" style={{ marginTop: 36 }}>
      <a href="#/signup" className="btn primary lg">
        Start free
      </a>
      <a href="#/product" className="btn lg ghost">
        Read the manual
      </a>
    </div>
  </div>
);

window.HeroSplit = HeroSplit;
window.HeroTerminal = HeroTerminal;
window.HeroEditorial = HeroEditorial;
window.MoeDemo = MoeDemo;
window.TICKER_LOGOS = TICKER_LOGOS;
