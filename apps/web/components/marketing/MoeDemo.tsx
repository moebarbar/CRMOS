'use client';

import { useEffect, useState } from 'react';
import { Icon } from '@/components/brand/Icon';
import { MoeIcon } from '@/components/brand/MoeIcon';

interface Script {
  cmd: string;
  thinking: string[];
  result: {
    title: string;
    body: { k: string; v: string }[];
    cta: string;
  };
}

const SCRIPTS: Script[] = [
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

export function MoeDemo() {
  const [scriptIdx, setScriptIdx] = useState(0);
  const [phase, setPhase] = useState<'typing' | 'thinking' | 'result'>('typing');
  const [typed, setTyped] = useState('');
  const [thinkIdx, setThinkIdx] = useState(0);
  const cur = SCRIPTS[scriptIdx]!;

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
  }, [scriptIdx, cur.cmd]);

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
  }, [phase, cur.thinking.length]);

  useEffect(() => {
    if (phase !== 'result') return;
    const t = setTimeout(() => setScriptIdx((scriptIdx + 1) % SCRIPTS.length), 4200);
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
              <button type="button" className="btn primary sm">
                {cur.result.cta} <Icon name="arrow" size={14} />
              </button>
              <button type="button" className="btn ghost sm">
                Edit
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="moe-demo-suggestions">
        {SCRIPTS.map((s, i) => (
          <button
            type="button"
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
}
