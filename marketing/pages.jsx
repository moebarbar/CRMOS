// CRMOS — Secondary marketing pages

const ProductPage = () => (
  <div className="page-wrap">
    <div className="page-head">
      <div className="tag mono"><span className="dot" /> PRODUCT · MOE</div>
      <h1 className="page-title">The AI agent <span className="highlight">that runs the business.</span></h1>
      <p className="page-lede">Moe is permission-aware, audit-logged, and trained on your tone. Three superpowers, all surfaced from one command bar.</p>
    </div>

    <div className="product-pillars">
      {[
        { icon: 'mic', title: 'Voice-to-text, polished.', desc: 'Tap mic on any text input. Speak. Moe transcribes and rewrites it in your tone — trained on your past emails, proposals, and chases.', tag: 'IN ANY INPUT' },
        { icon: 'sparkle', title: 'Voice-to-action, executed.', desc: 'Global hotkey or "Hey Moe". Speak naturally. Moe plans which tools to call, asks for confirmation on destructive or external actions, and executes.', tag: 'EVERYWHERE' },
        { icon: 'workflow', title: 'Tools, not text.', desc: 'Every CRUD on every entity is exposed as a typed tool. Moe doesn\'t generate SQL or scrape the UI — it calls the same APIs you do.', tag: 'NATIVE' },
      ].map((p, i) => (
        <div key={i} className="pillar">
          <div className="pillar-tag mono">{p.tag}</div>
          <div className="pillar-icon"><Icon name={p.icon} size={28} stroke="var(--lime)" /></div>
          <h3>{p.title}</h3>
          <p>{p.desc}</p>
        </div>
      ))}
    </div>

    <div className="moe-script-box">
      <div className="tag lime mono"><span className="dot" /> SAMPLE TRANSCRIPT</div>
      <h2>"Hey Moe, what's the day look like?"</h2>
      <div className="script-stream">
        <div className="script-line user"><Avatar name="You" size={26} /> "What's the day look like?"</div>
        <div className="script-line moe"><MoeIcon size={26} state="speaking" /><div>3 things on your plate. Want me to walk through them?</div></div>
        <div className="script-line moe"><span className="script-spacer" /><div className="mono"><span className="dot" />{' Acme proposal · viewed 2× · no reply (5d)'}</div></div>
        <div className="script-line moe"><span className="script-spacer" /><div className="mono"><span className="dot" />{' Northwind invoice · 11d overdue · $4,200'}</div></div>
        <div className="script-line moe"><span className="script-spacer" /><div className="mono"><span className="dot" />{' Halstead kickoff call · 3pm · agenda not sent'}</div></div>
        <div className="script-line user"><Avatar name="You" size={26} /> "Chase Acme and Northwind. Send the Halstead agenda."</div>
        <div className="script-line moe"><MoeIcon size={26} state="thinking" /><div>On it. I'll draft all three in your tone and ask you to approve before sending.</div></div>
      </div>
    </div>
  </div>
);

const AgenciesPage = () => (
  <div className="page-wrap">
    <div className="page-head">
      <div className="tag mono"><span className="dot" /> FOR AGENCIES</div>
      <h1 className="page-title">Run it as <span className="highlight">your own product.</span></h1>
      <p className="page-lede">White-label CRMOS to your domain, your brand, your CSS. Resell it to your clients as a recurring revenue line.</p>
    </div>
    <div className="agency-grid">
      {[
        { icon: 'globe', title: 'Custom domain', desc: 'app.youragency.com. SSL auto. Zero CRMOS branding visible.' },
        { icon: 'mail', title: 'Custom email', desc: 'Send from hello@youragency.com. SPF/DKIM auto-configured.' },
        { icon: 'sparkle', title: 'Your CSS', desc: 'Theme tokens, custom fonts, accent colors. CSS injection for power users.' },
        { icon: 'users', title: 'Multi-tenant', desc: 'One instance, N client workspaces. Bill them however you want.' },
        { icon: 'lock', title: 'Roles & permissions', desc: 'Granular per-module. Clients see what you let them see.' },
        { icon: 'workflow', title: 'White-label Moe', desc: 'Rename Moe. Your AI agent. Your IP narrative.' },
      ].map((f, i) => (
        <div key={i} className="agency-card">
          <Icon name={f.icon} size={22} stroke="var(--lime)" />
          <h3>{f.title}</h3>
          <p>{f.desc}</p>
        </div>
      ))}
    </div>
    <div className="agency-pricing-callout">
      <div>
        <div className="tag lime mono">AGENCY TIER · $99/user</div>
        <h2 style={{ marginTop: 12 }}>Resell at <span className="lime-text">$199/user.</span></h2>
        <p>Average agency adds <strong>$2,400 MRR</strong> in the first 60 days.</p>
      </div>
      <a href="#/pricing" className="btn primary lg">See pricing <Icon name="arrow" size={16} /></a>
    </div>
  </div>
);

const CUSTOMER_STORIES = [
  { name: 'Halstead Studio', who: 'Brand agency · 18 ppl', metric: '+24%', metricLabel: 'close rate', quote: 'We replaced HubSpot, Asana, Harvest, DocuSign, and FreshBooks. Moe sends our proposal chases now. Wild.', img: { from: '#a78bfa', to: '#7c3aed' } },
  { name: 'Northwind Co.', who: 'Dev consultancy · 6 ppl', metric: '$18k', metricLabel: 'recovered AR', quote: "Moe found 11 invoices we'd forgotten to chase. Got $18k back in 3 weeks.", img: { from: '#60a5fa', to: '#2563eb' } },
  { name: 'Bywater Design', who: 'Solo founder', metric: '−$420', metricLabel: 'monthly tools', quote: 'I was paying for nine SaaS subs. Now one. Moe handles the parts I used to dread.', img: { from: '#c4f048', to: '#8ba832' } },
  { name: 'Cipher Group', who: 'Marketing micro-agency · 4 ppl', metric: '6 hrs', metricLabel: 'saved/wk', quote: "Pipeline → proposal → contract → project autoflow. Zero handoff meetings.", img: { from: '#fb7185', to: '#ef4444' } },
];

const CustomersPage = () => (
  <div className="page-wrap">
    <div className="page-head">
      <div className="tag mono"><span className="dot" /> CUSTOMERS</div>
      <h1 className="page-title">Real teams. <span className="highlight">Real numbers.</span></h1>
      <p className="page-lede">4,200+ small teams run their business on CRMOS. Here's what changed.</p>
    </div>
    <div className="customer-grid">
      {CUSTOMER_STORIES.map((c, i) => (
        <div key={i} className="customer-card">
          <div className="customer-portrait" style={{ background: `linear-gradient(135deg, ${c.img.from}, ${c.img.to})` }}>
            <div className="customer-metric">
              <div className="customer-metric-num lime-text">{c.metric}</div>
              <div className="customer-metric-label mono">{c.metricLabel}</div>
            </div>
          </div>
          <div className="customer-body">
            <div className="customer-meta mono">{c.who}</div>
            <div className="customer-name">{c.name}</div>
            <p className="customer-quote">"{c.quote}"</p>
            <a href="#" className="customer-link mono">Read the story <Icon name="arrow" size={12} /></a>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const CHANGELOG = [
  { date: 'Apr 24, 2026', tag: 'NEW', title: 'Moe v2 — voice-to-action everywhere', body: 'Moe now executes multi-step plans with confirmation. Replaces Zapier for ~80% of internal automations.', kind: 'feature' },
  { date: 'Apr 17, 2026', tag: 'IMPROVED', title: 'Proposals — drag-drop pricing tables', body: 'Inline editing, keyboard shortcuts, and 12 new templates. 2× faster to build a proposal.', kind: 'improve' },
  { date: 'Apr 09, 2026', tag: 'NEW', title: 'Client portal · custom domains', body: 'Point portal.yourcompany.com at us. SSL auto. Available on Team & Agency tiers.', kind: 'feature' },
  { date: 'Mar 30, 2026', tag: 'FIX', title: 'Stripe webhook race conditions', body: 'Fixed a bug where simultaneous payments could double-mark an invoice as paid.', kind: 'fix' },
  { date: 'Mar 22, 2026', tag: 'NEW', title: 'Forms 2.0 — conditional logic', body: 'Branches, calculations, and payment collection. Auto-create deals or projects on submit.', kind: 'feature' },
  { date: 'Mar 14, 2026', tag: 'IMPROVED', title: 'Universal inbox — keyboard shortcuts', body: 'Linear-style shortcuts. j/k, e to archive, # to label. Power users rejoice.', kind: 'improve' },
];

const ChangelogPage = () => (
  <div className="page-wrap">
    <div className="page-head">
      <div className="tag mono"><span className="dot" /> CHANGELOG</div>
      <h1 className="page-title">What's <span className="highlight">new.</span></h1>
      <p className="page-lede">Shipped weekly. RSS feed at /changelog.rss.</p>
    </div>
    <div className="changelog">
      {CHANGELOG.map((c, i) => (
        <div key={i} className="changelog-item">
          <div className="changelog-date mono">{c.date}</div>
          <div className="changelog-body">
            <div className="changelog-meta">
              <span className={`tag mono changelog-${c.kind}`}>{c.tag}</span>
              <h3>{c.title}</h3>
            </div>
            <p>{c.body}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const LoginPage = () => {
  const [stage, setStage] = useState(0);
  return (
    <div className="login-wrap">
      <div className="login-card">
        <Logo size={32} />
        <h1 style={{ margin: '24px 0 8px', fontSize: 28 }}>{stage === 0 ? 'Welcome back.' : 'Check your email.'}</h1>
        <p style={{ color: 'var(--text-2)', marginBottom: 28 }}>
          {stage === 0 ? "Sign in to your CRMOS workspace." : "We sent a magic link to you@example.com."}
        </p>
        {stage === 0 ? (
          <>
            <button className="btn lg" style={{ width: '100%', justifyContent: 'center', marginBottom: 8 }}>
              <span style={{ width: 16, height: 16, background: '#fff', borderRadius: 4, display: 'inline-block' }} /> Continue with Google
            </button>
            <button className="btn lg" style={{ width: '100%', justifyContent: 'center', marginBottom: 16 }}>
              <Icon name="mail" size={16} /> Continue with Apple
            </button>
            <div className="login-divider mono">or</div>
            <input className="login-input" placeholder="you@example.com" />
            <button onClick={() => setStage(1)} className="btn primary lg" style={{ width: '100%', justifyContent: 'center', marginTop: 12 }}>Send magic link <Icon name="arrow" size={14} /></button>
            <p className="mono" style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 24, textAlign: 'center' }}>
              New here? <a href="#/signup" className="lime-text">Start free →</a>
            </p>
          </>
        ) : (
          <>
            <div className="login-mailbox"><Icon name="mail" size={28} stroke="var(--lime)" /></div>
            <a href="dashboard.html" className="btn primary lg" style={{ width: '100%', justifyContent: 'center' }}>Continue to dashboard <Icon name="arrow" size={14} /></a>
          </>
        )}
      </div>
      <div className="login-aside">
        <MoeIcon size={120} state="listening" />
        <h2 style={{ fontSize: 32, marginTop: 24, lineHeight: 1.1 }}>"Welcome back. <br/><span className="lime-text">Want me to summarize what happened while you were out?"</span></h2>
        <p style={{ color: 'var(--text-2)', marginTop: 16 }}>— Moe, every Monday morning</p>
      </div>
    </div>
  );
};

window.ProductPage = ProductPage;
window.AgenciesPage = AgenciesPage;
window.CustomersPage = CustomersPage;
window.ChangelogPage = ChangelogPage;
window.LoginPage = LoginPage;
