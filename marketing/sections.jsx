// CRMOS — Marketing site sections (features, personas, pricing, footer, etc.)

const FEATURES = [
  { icon: 'pipeline', name: 'CRM & Pipeline', desc: 'Drag-drop deals through stages. Forecast revenue. Won/lost analytics.', replaces: 'HubSpot, Pipedrive' },
  { icon: 'proposal', name: 'Proposals', desc: 'Drag-drop builder, pricing tables, video, click-to-sign.', replaces: 'Proposify, PandaDoc' },
  { icon: 'contract', name: 'Contracts', desc: 'Multi-party e-sign, audit trail, legal-grade Yousign passthrough.', replaces: 'DocuSign' },
  { icon: 'invoice', name: 'Invoices & Payments', desc: 'Stripe, ACH, PayPal. Recurring, dunning, multi-currency.', replaces: 'FreshBooks, Stripe Invoicing' },
  { icon: 'project', name: 'Projects & Tasks', desc: 'Kanban, list, table, timeline, Gantt. Pick your view.', replaces: 'Asana, ClickUp' },
  { icon: 'time', name: 'Time tracking', desc: 'Timer, timesheets, approvals. One-click bill the hours.', replaces: 'Toggl, Harvest' },
  { icon: 'calendar', name: 'Scheduling', desc: 'Round-robin, group, payment-to-book, intake forms.', replaces: 'Calendly, SavvyCal' },
  { icon: 'form', name: 'Forms', desc: 'Conditional logic, payment, auto-create deal/project.', replaces: 'Typeform, Tally' },
  { icon: 'inbox', name: 'Universal Inbox', desc: 'Email, SMS, portal messages, form submissions in one place.', replaces: 'Front, Missive' },
  { icon: 'portal', name: 'Client Portal', desc: 'Branded. Custom domain. Clients see only their stuff.', replaces: 'SuperOkay, Copilot' },
  { icon: 'workflow', name: 'Automations', desc: '30+ triggers, 50+ actions, branching, delays, loops.', replaces: 'Zapier, Make' },
  { icon: 'globe', name: 'White-label', desc: 'Custom domain, email, CSS. Run it as your own product.', replaces: '$10k of dev work' },
];

const FeatureGrid = () => (
  <section className="section">
    <div className="section-head">
      <div className="tag mono"><span className="dot" /> THE STACK</div>
      <h2>Twelve tools. <span className="highlight">One app.</span></h2>
      <p className="section-lede">
        Everything connected by default — a deal becomes a proposal, a sign
        becomes a contract, a contract becomes a project, time becomes an invoice.
      </p>
    </div>
    <div className="feature-grid">
      {FEATURES.map((f, i) => (
        <div key={i} className={`feature-card ${i === 0 || i === 9 ? 'featured' : ''}`}>
          <div className="feature-icon"><Icon name={f.icon} size={20} stroke="var(--lime)" /></div>
          <h3>{f.name}</h3>
          <p>{f.desc}</p>
          <div className="feature-replaces mono"><span className="strike">{f.replaces}</span></div>
        </div>
      ))}
    </div>
  </section>
);

const MoeShowcase = () => {
  const commands = [
    { who: 'Sarah · solo founder', cmd: 'Send Diego the website proposal v2', result: 'Proposal sent · viewed in 12m' },
    { who: 'Marcus · agency owner', cmd: 'Acme just signed — kick off the project', result: 'Project + 12 tasks created from template' },
    { who: 'Lena · freelance designer', cmd: 'Invoice last week\'s hours to all active clients', result: '4 invoices · $18,400 ready to send' },
    { who: 'Theo · consultant', cmd: 'Show me overdue invoices and draft chases', result: '3 chases drafted in your tone' },
    { who: 'Ana · ops lead', cmd: 'Block 2 hours Friday for deep work', result: 'Calendar held · auto-decline meetings' },
  ];
  return (
    <section className="section section-dark">
      <div className="moe-showcase">
        <div className="moe-showcase-left">
          <div className="tag lime mono"><span className="dot" /> MOE · THE AI LAYER</div>
          <h2>Not a chatbot.<br /><span className="highlight">An operator.</span></h2>
          <p className="section-lede">
            Every action in CRMOS — every CRUD on every entity — is exposed to Moe
            as a typed tool. Speak or type. Moe figures out which tools to call,
            asks before destructive actions, and executes.
          </p>
          <div className="moe-bullets">
            <div className="moe-bullet"><Icon name="mic" size={16} stroke="var(--lime)" /><div><strong>Voice-to-action.</strong> Tap-to-talk anywhere or "Hey Moe" on mobile.</div></div>
            <div className="moe-bullet"><Icon name="sparkle" size={16} stroke="var(--lime)" /><div><strong>Trained on your tone.</strong> Drafts and chases sound like <em>you</em>, not GPT.</div></div>
            <div className="moe-bullet"><Icon name="lock" size={16} stroke="var(--lime)" /><div><strong>Permission-aware.</strong> Audit-logged. Confirms external sends.</div></div>
            <div className="moe-bullet"><Icon name="user" size={16} stroke="var(--lime)" /><div><strong>Memory-enabled.</strong> Knows your common clients, project shapes, defaults.</div></div>
          </div>
        </div>
        <div className="moe-showcase-right">
          <div className="moe-feed">
            {commands.map((c, i) => (
              <div key={i} className="moe-feed-item" style={{ animationDelay: `${i * 0.15}s` }}>
                <div className="moe-feed-who mono">{c.who}</div>
                <div className="moe-feed-cmd">"{c.cmd}"</div>
                <div className="moe-feed-result"><MoeIcon size={20} state="speaking" /> {c.result}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const PERSONAS = [
  {
    role: 'Solo founder',
    name: 'Sarah Chen',
    quote: '"I spent $480/mo across 9 SaaS tools. CRMOS replaced all of them for $39."',
    metric: '−$441/mo',
    img: { from: '#c4f048', to: '#8ba832' },
  },
  {
    role: 'Freelance designer',
    name: 'Lena Rivers',
    quote: '"Moe invoices my hours every Friday. I literally never log into anything else."',
    metric: '6 hrs/week back',
    img: { from: '#fb7185', to: '#ef4444' },
  },
  {
    role: 'Micro-agency',
    name: 'Marcus Cole',
    quote: '"White-labeled it on our domain. Clients think we built it. We bill it as a service."',
    metric: '$2k MRR uplift',
    img: { from: '#60a5fa', to: '#2563eb' },
  },
  {
    role: 'Service SMB · 18 ppl',
    name: 'Halstead Studio',
    quote: '"Pipeline → proposal → contract → invoice → project. Zero context switches."',
    metric: '+24% close rate',
    img: { from: '#a78bfa', to: '#7c3aed' },
  },
];

const Personas = () => (
  <section className="section">
    <div className="section-head">
      <div className="tag mono"><span className="dot" /> WHO IT'S FOR</div>
      <h2>Built for the people<br /><span className="highlight">running it themselves.</span></h2>
    </div>
    <div className="persona-grid">
      {PERSONAS.map((p, i) => (
        <div key={i} className="persona-card">
          <div className="persona-portrait" style={{ background: `linear-gradient(135deg, ${p.img.from}, ${p.img.to})` }}>
            <div className="persona-noise" />
            <Avatar name={p.name} size={56} color="rgba(255,255,255,0.25)" />
          </div>
          <div className="persona-meta mono">{p.role}</div>
          <div className="persona-quote">{p.quote}</div>
          <div className="persona-foot">
            <span className="persona-name">{p.name}</span>
            <span className="persona-metric mono lime-text">{p.metric}</span>
          </div>
        </div>
      ))}
    </div>
  </section>
);

const FlowDiagram = () => {
  const stations = [
    { id: 'form', name: 'Form', sub: 'Lead capture', stat: '142', label: 'this wk', icon: 'form' },
    { id: 'lead', name: 'Lead', sub: 'Qualified', stat: '38', label: 'in pipe', icon: 'sparkle' },
    { id: 'deal', name: 'Deal', sub: 'Engaged', stat: '$340k', label: 'open', icon: 'pipeline' },
    { id: 'proposal', name: 'Proposal', sub: 'Drafted by Moe', stat: '7', label: 'sent', icon: 'proposal' },
    { id: 'contract', name: 'Contract', sub: 'E-signed', stat: '4', label: 'signed', icon: 'contract' },
    { id: 'project', name: 'Project', sub: 'In delivery', stat: '12', label: 'active', icon: 'project' },
    { id: 'time', name: 'Time', sub: 'Tracked + billed', stat: '284h', label: 'billable', icon: 'time' },
    { id: 'invoice', name: 'Invoice', sub: 'Auto-issued', stat: '$48k', label: 'sent', icon: 'invoice' },
    { id: 'paid', name: 'Paid', sub: 'Reconciled', stat: '$41k', label: 'collected', icon: 'check' },
  ];

  const [tickerIdx, setTickerIdx] = React.useState(0);
  const ticker = [
    { stage: 'paid', who: 'Northwind', what: 'paid invoice $4,200', t: '2m ago', good: true },
    { stage: 'contract', who: 'Acme', what: 'signed proposal · contract auto-drafted', t: '14m ago', good: true },
    { stage: 'lead', who: 'Bywater', what: 'submitted form → Moe replied in 90s', t: '32m ago', good: true },
    { stage: 'invoice', who: 'Cipher Co.', what: 'invoice sent · 14d net', t: '1h ago', good: true },
    { stage: 'project', who: 'Halstead', what: 'kickoff scheduled · agenda drafted', t: '3h ago', good: true },
  ];

  React.useEffect(() => {
    const t = setInterval(() => setTickerIdx(i => (i + 1) % ticker.length), 2800);
    return () => clearInterval(t);
  }, []);

  const activeStage = ticker[tickerIdx].stage;

  return (
    <section className="section section-flow">
      <div className="section-head">
        <div className="tag mono"><span className="dot" /> CONNECTED BY DEFAULT</div>
        <h2>Lead in. <span className="highlight">Cash out.</span></h2>
        <p className="section-lede">No exports. No re-entry. No glue code. The whole revenue funnel lives in one schema — and Moe walks every engagement from form to paid.</p>
      </div>

      <div className="flow-rail-wrap">
        {/* Animated track */}
        <svg className="flow-track" viewBox="0 0 1200 80" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id="flow-track-grad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="var(--lime)" stopOpacity="0.15" />
              <stop offset="50%" stopColor="var(--lime)" stopOpacity="0.6" />
              <stop offset="100%" stopColor="var(--lime)" stopOpacity="0.15" />
            </linearGradient>
          </defs>
          <line x1="60" y1="40" x2="1140" y2="40" stroke="var(--line-2)" strokeWidth="2" strokeDasharray="4 6" />
          <line x1="60" y1="40" x2="1140" y2="40" stroke="url(#flow-track-grad)" strokeWidth="2" />
          {/* Pulse particle */}
          <circle r="5" fill="var(--lime)" opacity="0.95">
            <animateMotion dur="9s" repeatCount="indefinite" path="M 60 40 L 1140 40" />
            <animate attributeName="r" values="5;7;5" dur="0.6s" repeatCount="indefinite" />
          </circle>
          <circle r="14" fill="none" stroke="var(--lime)" strokeOpacity="0.5" strokeWidth="1">
            <animateMotion dur="9s" repeatCount="indefinite" path="M 60 40 L 1140 40" />
            <animate attributeName="r" values="8;18;8" dur="1.2s" repeatCount="indefinite" />
            <animate attributeName="stroke-opacity" values="0.5;0;0.5" dur="1.2s" repeatCount="indefinite" />
          </circle>
        </svg>

        <div className="flow-stations">
          {stations.map((s, i) => (
            <div key={s.id} className={`flow-station ${activeStage === s.id ? 'active' : ''}`}>
              <div className="flow-station-num mono">{String(i + 1).padStart(2, '0')}</div>
              <div className="flow-station-dot">
                <Icon name={s.icon} size={14} stroke="currentColor" />
              </div>
              <div className="flow-station-name">{s.name}</div>
              <div className="flow-station-sub mono">{s.sub}</div>
              <div className="flow-station-stat">
                <span className="flow-stat-num mono">{s.stat}</span>
                <span className="flow-stat-label mono">{s.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flow-live">
        <div className="flow-live-head">
          <span className="flow-live-pulse" />
          <span className="mono">LIVE · what just moved</span>
        </div>
        <div className="flow-live-feed">
          {ticker.map((t, i) => (
            <div key={i} className={`flow-live-row ${i === tickerIdx ? 'now' : ''}`}>
              <span className="flow-live-stage mono">{t.stage}</span>
              <span className="flow-live-who">{t.who}</span>
              <span className="flow-live-what">{t.what}</span>
              <span className="flow-live-t mono">{t.t}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flow-foot mono">
        <span><Icon name="bolt" size={14} stroke="var(--lime)" /> Avg journey: form → paid in 3.2 weeks</span>
        <span><Icon name="bolt" size={14} stroke="var(--lime)" /> Auto-handoffs: 0 manual steps</span>
        <span><Icon name="bolt" size={14} stroke="var(--lime)" /> Moe touches every stage</span>
      </div>
    </section>
  );
};

const Logos = () => (
  <section className="logos">
    <div className="logos-label mono">Trusted by 4,200+ small teams</div>
    <div className="logos-track">
      {[...TICKER_LOGOS, ...TICKER_LOGOS].map((l, i) => (
        <div key={i} className="logos-item mono">{l}</div>
      ))}
    </div>
  </section>
);

const TIERS = [
  {
    name: 'Solo',
    tag: 'For freelancers',
    price: 19,
    cta: 'Start free',
    feats: ['1 user', 'All modules', '500 Moe actions/mo', '5 GB storage', 'Community support'],
  },
  {
    name: 'Team',
    tag: 'For small teams',
    price: 39,
    perUser: true,
    featured: true,
    cta: 'Start free',
    feats: ['Up to 25 users', 'All modules + Automations', '2,000 Moe actions/user', 'Custom domain portal', 'Priority support', 'Roles & permissions'],
  },
  {
    name: 'Agency',
    tag: 'For white-labelers',
    price: 99,
    perUser: true,
    cta: 'Talk to us',
    feats: ['Unlimited users', 'White-label everything', '10,000 Moe actions/user', 'Custom email sending', 'Dedicated CSM', 'SSO + SCIM'],
  },
];

const Pricing = () => (
  <section className="section section-pricing" id="pricing">
    <div className="section-head">
      <div className="tag mono"><span className="dot" /> PRICING</div>
      <h2>Replaces $400+ in tools.<br /><span className="highlight">Costs $39.</span></h2>
      <p className="section-lede">Flat per-user. No module gates. No "contact sales" for basic features.</p>
    </div>
    <div className="pricing-grid">
      {TIERS.map((t, i) => (
        <div key={i} className={`tier ${t.featured ? 'featured' : ''}`}>
          {t.featured && <div className="tier-ribbon mono">MOST POPULAR</div>}
          <div className="tier-name">{t.name}</div>
          <div className="tier-tag mono">{t.tag}</div>
          <div className="tier-price">
            <span className="tier-currency">$</span>
            <span className="tier-num">{t.price}</span>
            <span className="tier-suffix mono">/mo{t.perUser ? ' · per user' : ''}</span>
          </div>
          <button className={`btn ${t.featured ? 'primary' : ''} lg`} style={{ width: '100%', justifyContent: 'center' }}>{t.cta}</button>
          <div className="tier-feats">
            {t.feats.map((f, j) => (
              <div key={j} className="tier-feat"><Icon name="check" size={14} stroke="var(--lime)" /> {f}</div>
            ))}
          </div>
        </div>
      ))}
    </div>
    <div className="pricing-foot mono">
      <span><Icon name="check" size={13} stroke="var(--lime)" /> 14-day trial</span>
      <span><Icon name="check" size={13} stroke="var(--lime)" /> Cancel anytime</span>
      <span><Icon name="check" size={13} stroke="var(--lime)" /> Migrate from HubSpot/Asana free</span>
    </div>
  </section>
);

const FAQ_ITEMS = [
  { q: 'How is this different from Notion or ClickUp?', a: 'Those are work-ops platforms. CRMOS is a business OS — it has CRM, proposals, contracts, invoicing, and payments built in as first-class objects, not databases you configure.' },
  { q: 'Is Moe just GPT in a sidebar?', a: 'No. Every CRUD action is wrapped as a typed tool. Moe plans, calls tools, confirms destructive actions, and audit-logs everything. It learns your tone from your past writing.' },
  { q: 'Can I migrate from HubSpot/Asana/FreshBooks?', a: 'Yes. We have one-click migrators for the top 14 tools. We do it for free during onboarding.' },
  { q: 'Do you support white-label?', a: 'Fully. Custom domain, custom email sending, your logo, your colors, your CSS — strip "CRMOS" everywhere. Available on the Agency tier.' },
  { q: 'What about data ownership?', a: 'Your data, your IP. Export anything to CSV/JSON anytime. We never train on your customer data.' },
];

const FAQ = () => {
  const [open, setOpen] = useState(0);
  return (
    <section className="section section-faq">
      <div className="section-head">
        <div className="tag mono"><span className="dot" /> QUESTIONS</div>
        <h2>Things you'll ask.</h2>
      </div>
      <div className="faq-list">
        {FAQ_ITEMS.map((item, i) => (
          <div key={i} className={`faq-item ${open === i ? 'open' : ''}`} onClick={() => setOpen(open === i ? -1 : i)}>
            <div className="faq-q">
              <span className="mono">{String(i + 1).padStart(2, '0')}</span>
              <span>{item.q}</span>
              <Icon name={open === i ? 'x' : 'plus'} size={16} />
            </div>
            {open === i && <div className="faq-a">{item.a}</div>}
          </div>
        ))}
      </div>
    </section>
  );
};

const CTA = () => (
  <section className="section section-cta">
    <div className="cta-card">
      <MoeIcon size={80} state="listening" />
      <h2>Run your whole business.<br /><span className="highlight">Or tell Moe.</span></h2>
      <p>Start free in 60 seconds. No card. Migrate from your old tools in one click.</p>
      <div className="hero-cta">
        <a href="#/signup" className="btn primary lg">Start free <Icon name="arrow" size={16} /></a>
        <a href="dashboard.html" className="btn lg ghost">Open the demo dashboard</a>
      </div>
    </div>
  </section>
);

const Footer = () => (
  <footer className="footer">
    <div className="footer-top">
      <div className="footer-brand">
        <Logo size={28} />
        <p>The AI-native business OS for small teams.</p>
      </div>
      <div className="footer-cols">
        <div className="footer-col">
          <h4>Product</h4>
          <a href="#/product">Moe (AI agent)</a>
          <a href="#/pricing">Pricing</a>
          <a href="#/changelog">Changelog</a>
          <a href="dashboard.html">Demo dashboard</a>
        </div>
        <div className="footer-col">
          <h4>Solutions</h4>
          <a href="#/agencies">For agencies</a>
          <a href="#/customers">Customers</a>
          <a href="#">For freelancers</a>
          <a href="#">For founders</a>
        </div>
        <div className="footer-col">
          <h4>Company</h4>
          <a href="#">About</a>
          <a href="#">Careers</a>
          <a href="#">Press</a>
          <a href="#">Contact</a>
        </div>
        <div className="footer-col">
          <h4>Legal</h4>
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
          <a href="#">DPA</a>
          <a href="#">Security</a>
        </div>
      </div>
    </div>
    <div className="footer-bottom mono">
      <span>© 2026 CRMOS Inc · Made by 4 people</span>
      <span>Status: <span className="lime-text">● all systems operational</span></span>
    </div>
  </footer>
);

window.FeatureGrid = FeatureGrid;
window.MoeShowcase = MoeShowcase;
window.Personas = Personas;
window.FlowDiagram = FlowDiagram;
window.Logos = Logos;
window.Pricing = Pricing;
window.FAQ = FAQ;
window.CTA = CTA;
window.Footer = Footer;
