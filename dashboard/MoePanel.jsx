// Moe panel — persistent right-side AI assistant
const { useState: useStateMoe, useEffect: useEffectMoe, useRef: useRefMoe } = React;

const MoePanel = ({ visible }) => {
  const [tab, setTab] = useStateMoe('chat');
  const [messages, setMessages] = useStateMoe([
    {
      who: 'moe',
      text: 'Morning Sarah. I scanned overnight — 1 signed proposal (Acme), 3 overdue invoices ($12.8k), 2 new leads from forms. Want to triage?',
      action: null,
    },
    { who: 'user', text: 'Show overdue and draft chases' },
    {
      who: 'moe',
      text: 'On it — pulled 3 invoices, drafted in your tone. Review before sending?',
      action: {
        title: '3 chases drafted',
        rows: [
          { k: 'Northwind', v: '$4,200 · 11d late' },
          { k: 'Stella & Co', v: '$6,400 · 5d late' },
          { k: 'Cipher', v: '$2,240 · 2d late' },
        ],
        cta: 'Review & send all',
      },
    },
  ]);
  const [input, setInput] = useStateMoe('');
  const [thinking, setThinking] = useStateMoe(false);
  const bodyRef = useRefMoe(null);

  useEffectMoe(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [messages, thinking]);

  const send = (text) => {
    if (!text.trim()) return;
    setMessages((m) => [...m, { who: 'user', text }]);
    setInput('');
    setThinking(true);
    setTimeout(() => {
      setThinking(false);
      const replies = {
        invoice: {
          text: 'Drafted invoice INV-1043 for Acme · $4,500 · 36 hours from last week. Send?',
          action: {
            title: 'INV-1043 ready',
            rows: [
              { k: 'Client', v: 'Acme Corp.' },
              { k: 'Amount', v: '$4,500' },
              { k: 'Hours', v: '36.0' },
              { k: 'Due', v: 'May 11' },
            ],
            cta: 'Send to ar@acme.com',
          },
        },
        book: {
          text: "Diego's open Thu 2:00–4:30. Holding 3:00 PM.",
          action: {
            title: 'Meeting drafted',
            rows: [
              { k: 'With', v: 'Diego' },
              { k: 'When', v: 'Thu 3:00 PM' },
              { k: 'Duration', v: '30 min' },
            ],
            cta: 'Send invite',
          },
        },
        proposal: {
          text: 'I have a proposal template for website redesign. Personalize for which client?',
          action: null,
        },
        default: { text: 'I can do that. Want me to confirm the details first?', action: null },
      };
      const k = text.toLowerCase().includes('invoice')
        ? 'invoice'
        : text.toLowerCase().includes('book')
          ? 'book'
          : text.toLowerCase().includes('proposal')
            ? 'proposal'
            : 'default';
      setMessages((m) => [...m, { who: 'moe', ...replies[k] }]);
    }, 1100);
  };

  return (
    <aside className="moe-panel">
      <div className="moe-panel-header">
        <MoeIcon size={32} state={thinking ? 'thinking' : 'idle'} />
        <div className="moe-panel-title">
          <div className="moe-panel-name">
            Moe{' '}
            <span className="tag lime mono" style={{ fontSize: 9 }}>
              v2
            </span>
          </div>
          <div className="moe-panel-status">
            <span className="dot" /> Listening · audit-logged
          </div>
        </div>
        <button className="icon-btn">
          <Icon name="settings" size={14} />
        </button>
      </div>
      <div className="moe-panel-tabs">
        {['chat', 'history', 'tools'].map((t) => (
          <div
            key={t}
            onClick={() => setTab(t)}
            className={`moe-panel-tab ${tab === t ? 'active' : ''}`}
          >
            {t}
          </div>
        ))}
      </div>
      <div className="moe-panel-body" ref={bodyRef}>
        {messages.map((m, i) => (
          <React.Fragment key={i}>
            <div className={`moe-bubble ${m.who}`}>{m.text}</div>
            {m.action && (
              <div className="moe-action-card">
                <h4>
                  <Icon name="sparkle" size={12} stroke="var(--lime)" /> {m.action.title}
                </h4>
                {m.action.rows.map((r, j) => (
                  <div key={j} className="moe-action-row">
                    <span>{r.k}</span>
                    <span>{r.v}</span>
                  </div>
                ))}
                <button
                  className="btn primary sm"
                  style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}
                >
                  {m.action.cta} <Icon name="arrow" size={12} />
                </button>
              </div>
            )}
          </React.Fragment>
        ))}
        {thinking && (
          <div
            className="moe-bubble moe"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, opacity: 0.85 }}
          >
            <span className="dot pulse" /> thinking…
          </div>
        )}
      </div>
      <div className="moe-suggested">
        {['Invoice last week', 'Show overdue', 'Book Diego Thu', 'Send Halstead agenda'].map(
          (s) => (
            <span key={s} className="moe-suggest-pill" onClick={() => send(s)}>
              {s}
            </span>
          ),
        )}
      </div>
      <div className="moe-panel-input">
        <div className="moe-input-box">
          <Icon name="sparkle" size={14} stroke="var(--lime)" />
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send(input)}
            placeholder="Tell Moe what to do…"
          />
          <span className="moe-input-mic">
            <Icon name="mic" size={14} stroke="var(--lime)" />
          </span>
        </div>
      </div>
    </aside>
  );
};

window.MoePanel = MoePanel;
