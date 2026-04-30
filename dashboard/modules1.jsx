// Dashboard modules — Part 1: Today, Inbox, Pipeline, Projects, Tasks
const { useState, useEffect, useMemo } = React;
const D = window.DASH_DATA;

const clientById = id => D.CLIENTS.find(c => c.id === id) || { name: '—', logo: '?', color: '#888' };
const userById = id => D.TEAM.find(u => u.id === id) || { name: '?', color: '#888' };
const projectById = id => D.PROJECTS.find(p => p.id === id) || { name: '—' };

// ---------- Today ----------
const TodayModule = () => {
  const totalDue = D.INVOICES.filter(i => i.status === 'overdue').reduce((a, b) => a + b.amount, 0);
  const pipeline = D.DEALS.filter(d => d.stage !== 'won').reduce((a, b) => a + b.value, 0);
  return (
    <>
      <div className="module-head">
        <div>
          <h1 className="module-title">Good morning, Sarah.</h1>
          <div className="module-sub">Monday, April 27 · You have 3 things on your plate today.</div>
        </div>
        <div className="module-toolbar">
          <button className="btn sm"><Icon name="plus" size={14} /> Quick capture</button>
          <button className="btn primary sm"><Icon name="sparkle" size={14} /> Ask Moe</button>
        </div>
      </div>
      <div className="module-content">
        <div className="stats-grid" style={{ marginBottom: 16 }}>
          <div className="stat">
            <div className="stat-label">Pipeline</div>
            <div className="stat-num">${(pipeline / 1000).toFixed(1)}k</div>
            <div className="stat-delta up"><Icon name="arrowUp" size={12} /> +$8.4k this week</div>
          </div>
          <div className="stat">
            <div className="stat-label">Overdue AR</div>
            <div className="stat-num" style={{ color: '#fb7185' }}>${(totalDue / 1000).toFixed(1)}k</div>
            <div className="stat-delta down">3 invoices · Moe drafted chases</div>
          </div>
          <div className="stat">
            <div className="stat-label">Active projects</div>
            <div className="stat-num">{D.PROJECTS.filter(p => p.status === 'active').length}</div>
            <div className="stat-delta">2 due this week</div>
          </div>
          <div className="stat">
            <div className="stat-label">Tracked today</div>
            <div className="stat-num">2:14</div>
            <div className="stat-delta up"><Icon name="play" size={11} /> Acme · running</div>
          </div>
        </div>

        <div className="today-grid">
          <div className="today-card">
            <h3><Icon name="calendar" size={14} /> Today's schedule <span className="tag mono">6 BLOCKS</span></h3>
            <div className="timeline">
              {D.TODAY_TIMELINE.map((t, i) => (
                <div key={i} className="timeline-row">
                  <div className="timeline-time">{t.time}</div>
                  <div className={`timeline-event ${t.type === 'focus' ? 'focus' : ''}`}>
                    <div className="timeline-event-title">{t.title}</div>
                    <div className="timeline-event-meta">
                      <span className="mono">{t.type}</span>
                      {t.client && <><span>·</span><span>{clientById(t.client).name}</span></>}
                      {t.team && (
                        <span className="avatar-stack" style={{ marginLeft: 'auto' }}>
                          {t.team.map(u => <Avatar key={u} name={userById(u).name} size={20} color={userById(u).color} />)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="today-card">
              <h3><MoeIcon size={16} state="speaking" /> Moe's morning brief</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13, lineHeight: 1.55, color: 'var(--text-1)' }}>
                <div><span className="dot" style={{ background: '#fb7185' }} /> <strong>Northwind</strong> is 11d overdue — chase drafted in your tone.</div>
                <div><span className="dot" /> <strong>Acme</strong> signed the proposal at 11:42 PM. Project + 12 tasks created.</div>
                <div><span className="dot" style={{ background: '#fbbf24' }} /> <strong>Bywater</strong> viewed your proposal 6 times — high intent.</div>
                <div><span className="dot" style={{ background: '#60a5fa' }} /> 2 new leads from forms overnight.</div>
              </div>
              <button className="btn sm" style={{ marginTop: 12, width: '100%', justifyContent: 'center' }}>Review the 3 chases <Icon name="arrow" size={12} /></button>
            </div>
            <div className="today-card">
              <h3><Icon name="bolt" size={14} /> Quick actions</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {[
                  { i: 'invoice', l: 'New invoice' },
                  { i: 'proposal', l: 'New proposal' },
                  { i: 'plus', l: 'New deal' },
                  { i: 'time', l: 'Start timer' },
                ].map((a, i) => (
                  <button key={i} className="btn sm" style={{ justifyContent: 'flex-start' }}><Icon name={a.i} size={14} /> {a.l}</button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// ---------- Inbox ----------
const InboxModule = () => {
  const [selected, setSelected] = useState(D.INBOX_MESSAGES[0]);
  const [filter, setFilter] = useState('all');
  const filtered = filter === 'all' ? D.INBOX_MESSAGES : D.INBOX_MESSAGES.filter(m => m.channel === filter);
  return (
    <div className="inbox-layout">
      <div className="inbox-list">
        <div className="inbox-filters">
          {['all', 'email', 'sms', 'form', 'portal'].map(f => (
            <div key={f} onClick={() => setFilter(f)} className={`inbox-filter ${filter === f ? 'active' : ''}`}>{f}</div>
          ))}
        </div>
        {filtered.map(m => (
          <div key={m.id} onClick={() => setSelected(m)} className={`inbox-msg ${m.unread ? 'unread' : ''} ${selected?.id === m.id ? 'active' : ''}`}>
            <div className="inbox-msg-row">
              <div className="inbox-msg-from">{m.name}</div>
              <span className={`channel-badge channel-${m.channel}`}>{m.channel}</span>
              <div className="inbox-msg-time">{m.time}</div>
            </div>
            <div className="inbox-msg-subj">{m.subject}</div>
            <div className="inbox-msg-preview">{m.preview}</div>
          </div>
        ))}
      </div>
      <div className="inbox-detail">
        {selected && (
          <>
            <div className="inbox-detail-head">
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span className={`channel-badge channel-${selected.channel}`}>{selected.channel}</span>
                <span className="mono" style={{ fontSize: 11, color: 'var(--text-3)' }}>{selected.from}</span>
              </div>
              <h2 className="inbox-detail-title">{selected.subject}</h2>
              <div className="inbox-detail-meta">
                <Avatar name={selected.name} size={24} />
                <span>{selected.name}</span>
                <span>·</span>
                <span>{selected.time} ago</span>
              </div>
            </div>
            {selected.ai && (
              <div className="inbox-ai-summary">
                <MoeIcon size={20} state="speaking" />
                <div>
                  <strong>Moe summary:</strong> {selected.preview} I drafted a reply matching your tone — review below.
                </div>
              </div>
            )}
            <div className="inbox-body">
              <p>{selected.preview}</p>
              <p>Looking forward to your reply,<br/>{selected.name.split(' ')[0]}</p>
            </div>
            <div className="reply-box">
              <textarea defaultValue={selected.ai ? `Hey ${selected.name.split(' ')[0]} — sounds great. We can kick off Monday with a 30-min sync, then start the discovery sprint Tuesday. I'll send a calendar hold and the kickoff agenda this afternoon.\n\nSarah` : ''} placeholder="Reply…" />
              <div className="reply-foot">
                <div className="reply-tools">
                  <button className="icon-btn"><Icon name="paperclip" size={14} /></button>
                  <button className="icon-btn"><Icon name="mic" size={14} /></button>
                  <button className="icon-btn"><Icon name="sparkle" size={14} /></button>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn sm">Save draft</button>
                  <button className="btn primary sm"><Icon name="send" size={12} /> Send</button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ---------- Pipeline ----------
const PipelineModule = () => {
  const dealsByStage = useMemo(() => {
    const m = {};
    D.PIPELINE_STAGES.forEach(s => m[s.id] = D.DEALS.filter(d => d.stage === s.id));
    return m;
  }, []);
  const total = D.DEALS.reduce((a, b) => a + b.value, 0);
  return (
    <>
      <div className="module-head">
        <div>
          <h1 className="module-title">Pipeline</h1>
          <div className="module-sub">${(total / 1000).toFixed(1)}k across {D.DEALS.length} deals · forecasting ${(total * 0.42 / 1000).toFixed(1)}k closed in Q2</div>
        </div>
        <div className="module-toolbar">
          <button className="btn sm"><Icon name="filter" size={14} /> Filter</button>
          <button className="btn sm"><Icon name="sort" size={14} /> Group</button>
          <button className="btn primary sm"><Icon name="plus" size={14} /> New deal</button>
        </div>
      </div>
      <div className="tabs">
        <div className="tab active">Board</div>
        <div className="tab">List</div>
        <div className="tab">Forecast</div>
        <div className="tab">Activity</div>
      </div>
      <div className="module-content">
        <div className="kanban">
          {D.PIPELINE_STAGES.map(stage => {
            const deals = dealsByStage[stage.id] || [];
            const sum = deals.reduce((a, b) => a + b.value, 0);
            return (
              <div key={stage.id} className="kanban-col">
                <div className="kanban-col-head">
                  <span className="kanban-col-stage-dot" style={{ background: stage.color }} />
                  <span className="kanban-col-name">{stage.name}</span>
                  <span className="kanban-col-meta">{deals.length} · ${(sum / 1000).toFixed(1)}k</span>
                </div>
                {deals.map(d => {
                  const c = clientById(d.client);
                  const u = userById(d.owner);
                  return (
                    <div key={d.id} className="deal-card">
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                        <Avatar name={c.logo} size={20} color={c.color} />
                        <span className="mono" style={{ fontSize: 11, color: 'var(--text-2)' }}>{c.name}</span>
                      </div>
                      <div className="deal-title">{d.title}</div>
                      <div className="deal-meta">
                        <span className="deal-value">${d.value.toLocaleString()}</span>
                        <Avatar name={u.name} size={20} color={u.color} />
                      </div>
                      <div className="deal-prog">
                        <div className="deal-prog-fill" style={{ width: `${d.p}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

// ---------- Projects ----------
const ProjectsModule = () => (
  <>
    <div className="module-head">
      <div>
        <h1 className="module-title">Projects</h1>
        <div className="module-sub">{D.PROJECTS.filter(p => p.status === 'active').length} active · 2 due this week</div>
      </div>
      <div className="module-toolbar">
        <button className="btn sm"><Icon name="layout" size={14} /> Grid</button>
        <button className="btn sm"><Icon name="list" size={14} /> List</button>
        <button className="btn sm"><Icon name="gantt" size={14} /> Timeline</button>
        <button className="btn primary sm"><Icon name="plus" size={14} /> New project</button>
      </div>
    </div>
    <div className="module-content">
      <div className="project-grid">
        {D.PROJECTS.map(p => {
          const c = clientById(p.client);
          return (
            <div key={p.id} className="project-card">
              <div className="project-card-head">
                <Avatar name={c.logo} size={32} color={c.color} />
                <div style={{ flex: 1 }}>
                  <div className="project-card-name">{p.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-2)', fontFamily: 'var(--font-mono)' }}>{c.name}</div>
                </div>
                <span className={`status-pill status-${p.status}`}>{p.status}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-2)' }}>
                <span>Progress</span>
                <span className="mono">{p.progress}%</span>
              </div>
              <div className="project-progress-track">
                <div className="project-progress-fill" style={{ width: `${p.progress}%` }} />
              </div>
              <div className="project-card-foot">
                <span className="avatar-stack">
                  {p.team.map(u => <Avatar key={u} name={userById(u).name} size={22} color={userById(u).color} />)}
                </span>
                <span className="mono">Due {p.due}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  </>
);

// ---------- Tasks ----------
const TasksModule = () => (
  <>
    <div className="module-head">
      <div>
        <h1 className="module-title">Tasks</h1>
        <div className="module-sub">12 across 5 projects · 4 due today</div>
      </div>
      <div className="module-toolbar">
        <button className="btn sm"><Icon name="layout" size={14} /> Board</button>
        <button className="btn sm"><Icon name="list" size={14} /> List</button>
        <button className="btn sm"><Icon name="calendar" size={14} /> Calendar</button>
        <button className="btn primary sm"><Icon name="plus" size={14} /> New task</button>
      </div>
    </div>
    <div className="module-content">
      <div className="task-board">
        {[
          { k: 'todo', label: 'To do', dot: 'var(--text-3)' },
          { k: 'doing', label: 'Doing', dot: '#60a5fa' },
          { k: 'review', label: 'In review', dot: '#fbbf24' },
          { k: 'done', label: 'Done', dot: 'var(--lime)' },
        ].map(col => (
          <div key={col.k} className="task-col">
            <div className="task-col-head">
              <span className="kanban-col-stage-dot" style={{ background: col.dot }} />
              {col.label}
              <span className="task-col-count">{D.TASKS_BY_STATUS[col.k].length}</span>
            </div>
            {D.TASKS_BY_STATUS[col.k].map(t => {
              const proj = projectById(t.project);
              const u = userById(t.assignee);
              return (
                <div key={t.id} className="task-card">
                  <div className="task-title">{t.title}</div>
                  <div className="task-meta">
                    <span className={`priority-dot priority-${t.priority}`} />
                    <span>{proj.name?.split(' ')[0]}</span>
                    <span style={{ marginLeft: 'auto' }}>{t.due}</span>
                    <Avatar name={u.name} size={16} color={u.color} />
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  </>
);

window.TodayModule = TodayModule;
window.InboxModule = InboxModule;
window.PipelineModule = PipelineModule;
window.ProjectsModule = ProjectsModule;
window.TasksModule = TasksModule;
window.clientById = clientById;
window.userById = userById;
window.projectById = projectById;
