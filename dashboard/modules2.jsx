// Dashboard modules — Part 2: Proposals, Contracts, Invoices, Time, Scheduling, Forms, Portal, Automations
const D2 = window.DASH_DATA;

// ---------- Proposals ----------
const ProposalsModule = () => (
  <>
    <div className="module-head">
      <div>
        <h1 className="module-title">Proposals</h1>
        <div className="module-sub">{D2.PROPOSALS.length} total · {D2.PROPOSALS.filter(p => p.status === 'signed').length} signed this month</div>
      </div>
      <div className="module-toolbar">
        <button className="btn sm"><Icon name="template" size={14} /> Templates</button>
        <button className="btn primary sm"><Icon name="plus" size={14} /> New proposal</button>
      </div>
    </div>
    <div className="module-content">
      <div className="tile-grid">
        {D2.PROPOSALS.map(p => {
          const c = clientById(p.client);
          return (
            <div key={p.id} className="tile">
              <div className="tile-head">
                <span className={`status-pill status-${p.status}`}>{p.status}</span>
                <span className="tile-id mono">{p.id}</span>
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8 }}>
                <Avatar name={c.logo} size={28} color={c.color} />
                <div>
                  <div className="tile-title">{p.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-2)', fontFamily: 'var(--font-mono)' }}>{c.name}</div>
                </div>
              </div>
              <div className="tile-stats">
                <div className="tile-stat"><span>Value</span><strong className="lime-text">${(p.value / 1000).toFixed(1)}k</strong></div>
                <div className="tile-stat"><span>Sent</span><strong>{p.sent}</strong></div>
                <div className="tile-stat"><span>Views</span><strong>{p.views}</strong></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  </>
);

// ---------- Contracts ----------
const ContractsModule = () => {
  const rows = [
    { id: 'CTR-088', title: 'Acme · Q2 site relaunch · MSA', client: 'c1', value: 14500, signed: 'Apr 26', status: 'signed', signers: ['You', 'Andy Reeves'] },
    { id: 'CTR-087', title: 'Parallel · Q2 retainer agreement', client: 'c7', value: 18000, signed: 'Apr 1', status: 'signed', signers: ['You', 'Jo P.'] },
    { id: 'CTR-086', title: 'Northwind · Annual dev retainer', client: 'c2', value: 32000, signed: 'Mar 10', status: 'signed', signers: ['You', 'Northwind ops'] },
    { id: 'CTR-089', title: 'Bywater · Brand refresh SOW', client: 'c6', value: 14500, signed: '—', status: 'sent', signers: ['You', 'Kim B.'] },
    { id: 'CTR-090', title: 'Knudsen · NDA', client: 'c8', value: 0, signed: '—', status: 'draft', signers: ['You'] },
  ];
  return (
    <>
      <div className="module-head">
        <div>
          <h1 className="module-title">Contracts</h1>
          <div className="module-sub">Multi-party e-signature · audit trail · Yousign passthrough available</div>
        </div>
        <div className="module-toolbar">
          <button className="btn sm"><Icon name="upload" size={14} /> Upload</button>
          <button className="btn primary sm"><Icon name="plus" size={14} /> New contract</button>
        </div>
      </div>
      <div className="module-content">
        <table className="tbl">
          <thead><tr>
            <th>ID</th><th>Title</th><th>Client</th><th>Value</th><th>Signers</th><th>Signed</th><th>Status</th><th></th>
          </tr></thead>
          <tbody>
            {rows.map(r => {
              const c = clientById(r.client);
              return (
                <tr key={r.id}>
                  <td className="mono" style={{ color: 'var(--text-2)' }}>{r.id}</td>
                  <td style={{ fontWeight: 500 }}>{r.title}</td>
                  <td><span style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}><Avatar name={c.logo} size={20} color={c.color} /> {c.name}</span></td>
                  <td className="mono">{r.value ? `$${r.value.toLocaleString()}` : '—'}</td>
                  <td>{r.signers.join(', ')}</td>
                  <td className="mono" style={{ color: 'var(--text-2)' }}>{r.signed}</td>
                  <td><span className={`status-pill status-${r.status}`}>{r.status}</span></td>
                  <td><span className="row-action"><Icon name="more" size={16} /></span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
};

// ---------- Invoices ----------
const InvoicesModule = () => {
  const totals = {
    paid: D2.INVOICES.filter(i => i.status === 'paid').reduce((a, b) => a + b.amount, 0),
    overdue: D2.INVOICES.filter(i => i.status === 'overdue').reduce((a, b) => a + b.amount, 0),
    draft: D2.INVOICES.filter(i => i.status === 'draft').reduce((a, b) => a + b.amount, 0),
  };
  return (
    <>
      <div className="module-head">
        <div>
          <h1 className="module-title">Invoices</h1>
          <div className="module-sub">Stripe + ACH + PayPal · auto-dunning enabled</div>
        </div>
        <div className="module-toolbar">
          <button className="btn sm"><Icon name="download" size={14} /> Export</button>
          <button className="btn primary sm"><Icon name="plus" size={14} /> New invoice</button>
        </div>
      </div>
      <div className="module-content">
        <div className="stats-grid" style={{ marginBottom: 16 }}>
          <div className="stat"><div className="stat-label">Paid (30d)</div><div className="stat-num lime-text">${(totals.paid / 1000).toFixed(1)}k</div><div className="stat-delta up"><Icon name="arrowUp" size={11} /> +18% MoM</div></div>
          <div className="stat"><div className="stat-label">Overdue</div><div className="stat-num" style={{ color: '#fb7185' }}>${(totals.overdue / 1000).toFixed(1)}k</div><div className="stat-delta">3 invoices · Moe chasing</div></div>
          <div className="stat"><div className="stat-label">Drafts</div><div className="stat-num">${(totals.draft / 1000).toFixed(1)}k</div><div className="stat-delta">Ready to send</div></div>
          <div className="stat"><div className="stat-label">Avg DSO</div><div className="stat-num">14.2d</div><div className="stat-delta up">−2.1d</div></div>
        </div>
        <table className="tbl">
          <thead><tr><th>Invoice</th><th>Client</th><th>Amount</th><th>Issued</th><th>Due</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {D2.INVOICES.map(inv => {
              const c = clientById(inv.client);
              return (
                <tr key={inv.id}>
                  <td className="mono" style={{ fontWeight: 600 }}>{inv.id}</td>
                  <td><span style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}><Avatar name={c.logo} size={20} color={c.color} /> {c.name}</span></td>
                  <td className="mono" style={{ fontWeight: 600 }}>${inv.amount.toLocaleString()}</td>
                  <td className="mono" style={{ color: 'var(--text-2)' }}>{inv.issued}</td>
                  <td className="mono" style={{ color: 'var(--text-2)' }}>{inv.due}</td>
                  <td><span className={`status-pill status-${inv.status}`}>{inv.status}{inv.daysLate ? ` · ${inv.daysLate}d` : ''}</span></td>
                  <td><span className="row-action"><Icon name="more" size={16} /></span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
};

// ---------- Time ----------
const TimeModule = () => {
  const [running, setRunning] = useState(true);
  const [secs, setSecs] = useState(2 * 3600 + 14 * 60 + 22);
  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setSecs(s => s + 1), 1000);
    return () => clearInterval(t);
  }, [running]);
  const fmt = (s) => `${String(Math.floor(s / 3600)).padStart(2, '0')}:${String(Math.floor((s % 3600) / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  const entries = [
    { task: 'Build Acme homepage hero', project: 'Acme Q2 relaunch', dur: '2:14', billable: true, day: 'Today' },
    { task: 'Halstead identity exploration', project: 'Halstead identity', dur: '1:32', billable: true, day: 'Today' },
    { task: 'Internal · standup', project: '—', dur: '0:15', billable: false, day: 'Today' },
    { task: 'Northwind data viz QA', project: 'Northwind data viz', dur: '3:08', billable: true, day: 'Yesterday' },
    { task: 'Stella site map review', project: 'Stella campaign site', dur: '1:45', billable: true, day: 'Yesterday' },
    { task: 'Acme client call', project: 'Acme Q2 relaunch', dur: '0:42', billable: true, day: 'Yesterday' },
  ];
  return (
    <>
      <div className="module-head">
        <div>
          <h1 className="module-title">Time</h1>
          <div className="module-sub">This week: 28h 12m · 24h 18m billable · $4,860 to invoice</div>
        </div>
        <div className="module-toolbar">
          <button className="btn sm"><Icon name="download" size={14} /> Export timesheet</button>
          <button className="btn primary sm"><Icon name="invoice" size={14} /> Bill the hours</button>
        </div>
      </div>
      <div className="module-content">
        <div className="timer-bar">
          <div className="timer-display">{fmt(secs)}</div>
          <div className="timer-label">
            <div className="timer-task">Build Acme homepage hero</div>
            <div className="timer-project">Acme Q2 relaunch · billable</div>
          </div>
          <div className="timer-actions">
            <button className="timer-play" onClick={() => setRunning(!running)}>
              <Icon name={running ? 'pause' : 'play'} size={18} stroke="#06170a" fill={running ? '#06170a' : 'none'} />
            </button>
          </div>
        </div>
        <table className="tbl">
          <thead><tr><th>Task</th><th>Project</th><th>Duration</th><th>Billable</th><th>Day</th><th></th></tr></thead>
          <tbody>
            {entries.map((e, i) => (
              <tr key={i}>
                <td style={{ fontWeight: 500 }}>{e.task}</td>
                <td style={{ color: 'var(--text-2)' }}>{e.project}</td>
                <td className="mono" style={{ fontWeight: 600 }}>{e.dur}</td>
                <td>{e.billable ? <span className="lime-text mono">●</span> : <span style={{ color: 'var(--text-3)' }} className="mono">○</span>}</td>
                <td className="mono" style={{ color: 'var(--text-2)' }}>{e.day}</td>
                <td><span className="row-action"><Icon name="more" size={16} /></span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

// ---------- Scheduling ----------
const SchedulingModule = () => {
  const days = ['Mon 28', 'Tue 29', 'Wed 30', 'Thu 1', 'Fri 2'];
  const hours = ['9', '10', '11', '12', '13', '14', '15', '16'];
  const events = {
    '0-0': { t: 'Standup', busy: false },
    '1-1': { t: 'Acme review', busy: false },
    '2-3': { t: 'Lunch', busy: true },
    '3-2': { t: 'Diego 1:1', busy: false },
    '4-5': { t: 'Bywater', busy: false },
    '2-6': { t: 'Halstead kickoff', busy: false },
    '0-7': { t: 'Deep work', busy: true },
  };
  return (
    <>
      <div className="module-head">
        <div>
          <h1 className="module-title">Scheduling</h1>
          <div className="module-sub">3 booking pages · 142 bookings this month · round-robin enabled</div>
        </div>
        <div className="module-toolbar">
          <button className="btn sm"><Icon name="link" size={14} /> Copy link</button>
          <button className="btn primary sm"><Icon name="plus" size={14} /> New booking page</button>
        </div>
      </div>
      <div className="module-content">
        <div className="stats-grid" style={{ marginBottom: 16 }}>
          <div className="stat"><div className="stat-label">This month</div><div className="stat-num">142</div><div className="stat-delta up">+24%</div></div>
          <div className="stat"><div className="stat-label">Conv. rate</div><div className="stat-num">68%</div><div className="stat-delta up">view → book</div></div>
          <div className="stat"><div className="stat-label">No-show</div><div className="stat-num">2.1%</div><div className="stat-delta">Auto-reminders on</div></div>
          <div className="stat"><div className="stat-label">Paid bookings</div><div className="stat-num">$2,340</div><div className="stat-delta">22 sessions</div></div>
        </div>
        <div className="cal-grid">
          <div className="cal-cell head"></div>
          {days.map(d => <div key={d} className="cal-cell head">{d}</div>)}
          {hours.map((h, hi) => (
            <React.Fragment key={hi}>
              <div className="cal-cell time-col">{h}:00</div>
              {days.map((d, di) => {
                const e = events[`${di}-${hi}`];
                return (
                  <div key={di} className="cal-cell">
                    {e && <div className={`cal-event ${e.busy ? 'busy' : ''}`}>{e.t}</div>}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </>
  );
};

// ---------- Forms ----------
const FormsModule = () => (
  <>
    <div className="module-head">
      <div>
        <h1 className="module-title">Forms</h1>
        <div className="module-sub">{D2.FORMS.length} forms · 2,086 submissions this month</div>
      </div>
      <div className="module-toolbar">
        <button className="btn sm"><Icon name="template" size={14} /> Templates</button>
        <button className="btn primary sm"><Icon name="plus" size={14} /> New form</button>
      </div>
    </div>
    <div className="module-content">
      <div className="form-grid">
        {D2.FORMS.map(f => (
          <div key={f.id} className="form-tile">
            <div className="form-preview">
              <div className="form-preview-line tall" />
              <div className="form-preview-line" style={{ width: '90%' }} />
              <div className="form-preview-line" style={{ width: '70%' }} />
              <div className="form-preview-line" style={{ width: '85%' }} />
              <div className="form-preview-line btn" />
            </div>
            <div className="form-tile-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{f.name}</div>
                {f.paid && <span className="tag lime mono">PAID</span>}
              </div>
              <div className="tile-stats" style={{ paddingTop: 10, marginTop: 0, borderTop: 'none' }}>
                <div className="tile-stat"><span>Subs</span><strong>{f.subs}</strong></div>
                <div className="tile-stat"><span>Conv</span><strong>{f.conv}%</strong></div>
                <div className="tile-stat"><span>Last</span><strong style={{ fontSize: 12, fontFamily: 'var(--font-mono)' }}>{f.lastSub}</strong></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </>
);

// ---------- Portal preview ----------
const PortalModule = () => (
  <>
    <div className="module-head">
      <div>
        <h1 className="module-title">Client Portal</h1>
        <div className="module-sub">Branded · custom domain · clients see only their stuff</div>
      </div>
      <div className="module-toolbar">
        <button className="btn sm"><Icon name="settings" size={14} /> Branding</button>
        <button className="btn sm"><Icon name="globe" size={14} /> Domain</button>
        <button className="btn primary sm"><Icon name="eye" size={14} /> Preview as client</button>
      </div>
    </div>
    <div className="module-content">
      <div className="portal-window">
        <div className="portal-bar">
          <span className="terminal-dots"><span /><span /><span /></span>
          <div className="url">portal.halstead.studio/acme</div>
          <span className="tag lime mono"><span className="dot" /> LIVE</span>
        </div>
        <div className="portal-body">
          <div className="portal-hero">
            <Avatar name="AC" size={48} color="#c4f048" />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 20, fontWeight: 700 }}>Welcome back, Andy</div>
              <div style={{ fontSize: 13, color: 'var(--text-2)' }}>Your Q2 site relaunch is 64% complete · launch May 18</div>
            </div>
            <button className="btn primary sm">View project <Icon name="arrow" size={12} /></button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            <div className="portal-section">
              <div className="portal-section-title">Active project</div>
              <div className="card" style={{ padding: 16 }}>
                <div style={{ fontWeight: 600, marginBottom: 8 }}>Acme Q2 relaunch</div>
                <div className="project-progress-track"><div className="project-progress-fill" style={{ width: '64%' }} /></div>
                <div style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 8, fontFamily: 'var(--font-mono)' }}>NEXT: hero design review · Wed</div>
              </div>
            </div>
            <div className="portal-section">
              <div className="portal-section-title">Open invoice</div>
              <div className="card" style={{ padding: 16 }}>
                <div className="mono" style={{ fontSize: 11, color: 'var(--text-2)' }}>INV-1042</div>
                <div style={{ fontSize: 22, fontWeight: 700, margin: '4px 0' }}>$4,500</div>
                <button className="btn primary sm" style={{ width: '100%', justifyContent: 'center' }}>Pay now</button>
              </div>
            </div>
            <div className="portal-section">
              <div className="portal-section-title">Files</div>
              <div className="card" style={{ padding: 16 }}>
                {['brand-guidelines.pdf', 'hero-v3.fig', 'sitemap-v2.png'].map(f => (
                  <div key={f} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '6px 0', fontSize: 12 }}>
                    <Icon name="file" size={14} />{f}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </>
);

// ---------- Automations ----------
const AutomationsModule = () => {
  const [automations, setAutomations] = useState(D2.AUTOMATIONS);
  return (
    <>
      <div className="module-head">
        <div>
          <h1 className="module-title">Automations</h1>
          <div className="module-sub">5 active · 433 runs this month · saving ~12hr/week</div>
        </div>
        <div className="module-toolbar">
          <button className="btn sm"><Icon name="template" size={14} /> Templates</button>
          <button className="btn primary sm"><Icon name="plus" size={14} /> New automation</button>
        </div>
      </div>
      <div className="module-content">
        {automations.map(a => (
          <div key={a.id} className="auto-row">
            <div className="auto-icon"><Icon name="workflow" size={16} stroke="var(--lime)" /></div>
            <div>
              <div className="auto-name">{a.name}</div>
              <div className="auto-trigger">when · {a.trigger}</div>
            </div>
            <div className="mono" style={{ fontSize: 12, color: 'var(--text-2)' }}>{a.actions} actions</div>
            <div className="mono" style={{ fontSize: 12, color: 'var(--text-2)' }}>{a.runs} runs</div>
            <div className={`toggle ${a.on ? 'on' : ''}`} onClick={() => setAutomations(automations.map(x => x.id === a.id ? { ...x, on: !x.on } : x))} />
            <button className="icon-btn"><Icon name="more" size={14} /></button>
          </div>
        ))}
      </div>
    </>
  );
};

window.ProposalsModule = ProposalsModule;
window.ContractsModule = ContractsModule;
window.InvoicesModule = InvoicesModule;
window.TimeModule = TimeModule;
window.SchedulingModule = SchedulingModule;
window.FormsModule = FormsModule;
window.PortalModule = PortalModule;
window.AutomationsModule = AutomationsModule;
