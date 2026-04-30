'use client';

import { useState } from 'react';
import { Icon } from '@/components/brand/Icon';
import { MoeIcon } from '@/components/brand/MoeIcon';

/**
 * Phase 0/1/2 placeholder for Moe panel. The full agentic chat lands
 * in Phase 10 — this version delivers the visual fixture from the
 * uploaded mockup (header, tabs, morning brief bubble, suggested
 * pills, input bar). Wired to live data starts in Phase 10.
 */
export function MoePanel() {
  const [tab, setTab] = useState<'chat' | 'history' | 'tools'>('chat');
  const [input, setInput] = useState('');

  return (
    <aside className="moe-panel">
      <div className="moe-panel-header">
        <MoeIcon size={36} state="listening" />
        <div className="moe-panel-title">
          <div className="moe-panel-name">
            Moe <span className="tag mono">listening</span>
          </div>
          <div className="moe-panel-status">
            <span className="dot" /> audit-loops
          </div>
        </div>
        <button type="button" className="icon-btn" aria-label="More">
          <Icon name="more" size={16} />
        </button>
      </div>

      <div className="moe-panel-tabs">
        {(['chat', 'history', 'tools'] as const).map((t) => (
          <button
            key={t}
            type="button"
            className={`moe-panel-tab ${tab === t ? 'active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="moe-panel-body">
        <div className="moe-bubble moe">
          Morning. I scanned overnight — 1 signed proposal (Acme), 3 overdue invoices ($12.8k),
          2 new leads from forms. Want to triage?
        </div>
        <div className="moe-bubble user">Show overdue and draft chases</div>
        <div className="moe-bubble moe">
          On it — pulled 3 invoices, drafted in your tone. Review before sending?
        </div>
        <div className="moe-action-card">
          <h4>
            <Icon name="bolt" size={12} stroke="var(--lime)" /> 3 chases drafted
          </h4>
          <div className="moe-action-row">
            <span>Northwind</span>
            <span>$4,200 · 11d late</span>
          </div>
          <div className="moe-action-row">
            <span>Stella & Co</span>
            <span>$6,400 · 5d late</span>
          </div>
          <div className="moe-action-row">
            <span>Cipher</span>
            <span>$2,240 · 2d late</span>
          </div>
          <button type="button" className="btn primary sm" style={{ marginTop: 10, width: '100%' }}>
            Review & send all <Icon name="arrow" size={14} />
          </button>
        </div>
      </div>

      <div className="moe-suggested">
        {['Bill Acme last week', 'Today 1:1s', 'Forecast Q2'].map((s) => (
          <button key={s} type="button" className="moe-suggest-pill">
            {s}
          </button>
        ))}
      </div>

      <div className="moe-panel-input">
        <div className="moe-input-box">
          <Icon name="mic" size={16} stroke="var(--lime)" />
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tell Moe what to do…"
            aria-label="Message Moe"
          />
          <button type="button" className="icon-btn" aria-label="Send">
            <Icon name="send" size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}
