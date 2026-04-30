// CRMOS Dashboard — Sample data

const ME = { name: 'You', initials: 'YO', email: 'you@halstead.studio' };

const TEAM = [
  { id: 'u1', name: 'Sarah Chen', role: 'Founder', color: '#c4f048' },
  { id: 'u2', name: 'Diego Vargas', role: 'Designer', color: '#60a5fa' },
  { id: 'u3', name: 'Lena Rivers', role: 'Project lead', color: '#fb7185' },
  { id: 'u4', name: 'Marcus Cole', role: 'Developer', color: '#a78bfa' },
  { id: 'u5', name: 'Theo Park', role: 'Strategist', color: '#fbbf24' },
];

const CLIENTS = [
  { id: 'c1', name: 'Acme Corp.', email: 'ar@acme.com', mrr: 4500, status: 'active', logo: 'AC', color: '#c4f048' },
  { id: 'c2', name: 'Northwind', email: 'ops@northwind.io', mrr: 2800, status: 'active', logo: 'NW', color: '#60a5fa' },
  { id: 'c3', name: 'Cipher Group', email: 'finance@cipher.co', mrr: 1900, status: 'paused', logo: 'CG', color: '#fb7185' },
  { id: 'c4', name: 'Stella & Co', email: 'hello@stella.co', mrr: 6400, status: 'active', logo: 'SC', color: '#a78bfa' },
  { id: 'c5', name: 'Halstead', email: 'andy@halstead.com', mrr: 3200, status: 'active', logo: 'HA', color: '#fbbf24' },
  { id: 'c6', name: 'Bywater', email: 'kim@bywater.design', mrr: 0, status: 'lead', logo: 'BW', color: '#34d399' },
  { id: 'c7', name: 'Parallel', email: 'jo@parallel.app', mrr: 5200, status: 'active', logo: 'PA', color: '#f472b6' },
  { id: 'c8', name: 'Knudsen Inc', email: 'admin@knudsen.dk', mrr: 0, status: 'lead', logo: 'KN', color: '#22d3ee' },
];

const PIPELINE_STAGES = [
  { id: 'lead', name: 'Lead', color: '#7d8c84' },
  { id: 'qualified', name: 'Qualified', color: '#60a5fa' },
  { id: 'proposal', name: 'Proposal', color: '#fbbf24' },
  { id: 'negotiation', name: 'Negotiation', color: '#fb7185' },
  { id: 'won', name: 'Won', color: '#c4f048' },
];

const DEALS = [
  { id: 'd1', client: 'c6', title: 'Bywater · Brand refresh', value: 14500, stage: 'proposal', owner: 'u1', age: 5, p: 70 },
  { id: 'd2', client: 'c8', title: 'Knudsen · Website v3', value: 28000, stage: 'qualified', owner: 'u2', age: 2, p: 40 },
  { id: 'd3', client: 'c7', title: 'Parallel · Q2 retainer', value: 18000, stage: 'negotiation', owner: 'u1', age: 12, p: 80 },
  { id: 'd4', client: 'c1', title: 'Acme · Mobile app', value: 42000, stage: 'lead', owner: 'u3', age: 1, p: 25 },
  { id: 'd5', client: 'c2', title: 'Northwind · Annual', value: 32000, stage: 'won', owner: 'u1', age: 24, p: 100 },
  { id: 'd6', client: 'c4', title: 'Stella · Campaign site', value: 9800, stage: 'proposal', owner: 'u4', age: 7, p: 65 },
  { id: 'd7', client: 'c5', title: 'Halstead · Q3 expansion', value: 24000, stage: 'qualified', owner: 'u5', age: 3, p: 45 },
  { id: 'd8', client: 'c3', title: 'Cipher · Re-engage', value: 6500, stage: 'lead', owner: 'u3', age: 0, p: 15 },
  { id: 'd9', client: 'c1', title: 'Acme · Q2 site relaunch', value: 14500, stage: 'negotiation', owner: 'u2', age: 9, p: 75 },
];

const PROJECTS = [
  { id: 'p1', client: 'c1', name: 'Acme Q2 relaunch', status: 'active', progress: 64, due: 'May 18', team: ['u1', 'u2', 'u4'] },
  { id: 'p2', client: 'c4', name: 'Stella campaign site', status: 'active', progress: 32, due: 'Jun 02', team: ['u4', 'u5'] },
  { id: 'p3', client: 'c2', name: 'Northwind data viz', status: 'review', progress: 88, due: 'Apr 30', team: ['u2', 'u3'] },
  { id: 'p4', client: 'c5', name: 'Halstead identity', status: 'active', progress: 45, due: 'May 22', team: ['u1', 'u3'] },
  { id: 'p5', client: 'c7', name: 'Parallel onboarding', status: 'paused', progress: 18, due: 'TBD', team: ['u5'] },
];

const TASKS_BY_STATUS = {
  todo: [
    { id: 't1', title: 'Wireframe Acme homepage hero', project: 'p1', assignee: 'u2', due: 'today', priority: 'high', est: '4h' },
    { id: 't2', title: 'Pull Stella analytics for Q1', project: 'p2', assignee: 'u5', due: 'tomorrow', priority: 'med', est: '1h' },
    { id: 't3', title: 'Send Halstead kickoff agenda', project: 'p4', assignee: 'u1', due: 'today', priority: 'high', est: '15m' },
    { id: 't4', title: 'Review Parallel SOW v3', project: 'p5', assignee: 'u1', due: 'May 1', priority: 'low', est: '30m' },
  ],
  doing: [
    { id: 't5', title: 'Build Acme homepage hero', project: 'p1', assignee: 'u4', due: 'May 5', priority: 'high', est: '8h' },
    { id: 't6', title: 'Northwind data dashboard QA', project: 'p3', assignee: 'u3', due: 'Apr 30', priority: 'high', est: '3h' },
    { id: 't7', title: 'Halstead logo variations', project: 'p4', assignee: 'u3', due: 'May 2', priority: 'med', est: '6h' },
  ],
  review: [
    { id: 't8', title: 'Northwind chart library', project: 'p3', assignee: 'u2', due: 'Apr 30', priority: 'high', est: '—' },
    { id: 't9', title: 'Stella site map', project: 'p2', assignee: 'u4', due: 'May 4', priority: 'med', est: '—' },
  ],
  done: [
    { id: 't10', title: 'Acme brand audit', project: 'p1', assignee: 'u1', due: 'Apr 20', priority: 'med', est: '—' },
    { id: 't11', title: 'Stella stakeholder interviews', project: 'p2', assignee: 'u5', due: 'Apr 18', priority: 'low', est: '—' },
    { id: 't12', title: 'Northwind reqs doc', project: 'p3', assignee: 'u1', due: 'Apr 15', priority: 'high', est: '—' },
  ],
};

const INBOX_MESSAGES = [
  { id: 'm1', from: 'andy@acme.com', name: 'Andy Reeves', channel: 'email', subject: 'Re: Q2 site relaunch', preview: "Looks good — when can the team start? We'd ideally kick off Monday.", time: '12m', unread: true, ai: true },
  { id: 'm2', from: 'forms', name: 'New form submission', channel: 'form', subject: 'Contact form · Knudsen Inc', preview: 'Jonas Knudsen is interested in a website redesign. Budget: $25–40k.', time: '1h', unread: true },
  { id: 'm3', from: 'finance@cipher.co', name: 'Cipher Group', channel: 'email', subject: 'Invoice INV-1037', preview: 'Hi, just wired the payment. Should arrive tomorrow.', time: '2h', unread: true },
  { id: 'm4', from: 'sms', name: 'Lena Rivers', channel: 'sms', subject: 'SMS', preview: 'Running 5min late to the Halstead call', time: '3h', unread: false },
  { id: 'm5', from: 'portal', name: 'Stella & Co · Portal', channel: 'portal', subject: 'New file uploaded · brand-guidelines.pdf', preview: 'Maya uploaded brand-guidelines.pdf to the Stella project portal.', time: '5h', unread: false },
  { id: 'm6', from: 'jo@parallel.app', name: 'Jo Parallel', channel: 'email', subject: 'Pause Q2 retainer?', preview: "Hey — we're going to pause for a month while we restructure. Talk soon!", time: '8h', unread: false, ai: true },
  { id: 'm7', from: 'kim@bywater.design', name: 'Kim Bywater', channel: 'email', subject: 'Re: Brand refresh proposal', preview: 'Approved! When can we start?', time: '1d', unread: false, ai: true },
  { id: 'm8', from: 'sms', name: 'Marcus Cole', channel: 'sms', subject: 'SMS', preview: 'Pushed the Acme staging — ready for review', time: '1d', unread: false },
];

const INVOICES = [
  { id: 'INV-1042', client: 'c1', amount: 4500, status: 'draft', issued: '—', due: 'May 11' },
  { id: 'INV-1041', client: 'c4', amount: 6400, status: 'overdue', issued: 'Apr 12', due: 'Apr 22', daysLate: 5 },
  { id: 'INV-1040', client: 'c2', amount: 4200, status: 'overdue', issued: 'Apr 6', due: 'Apr 16', daysLate: 11 },
  { id: 'INV-1039', client: 'c3', amount: 2240, status: 'overdue', issued: 'Apr 18', due: 'Apr 25', daysLate: 2 },
  { id: 'INV-1038', client: 'c7', amount: 5200, status: 'paid', issued: 'Apr 2', due: 'Apr 12' },
  { id: 'INV-1037', client: 'c3', amount: 1900, status: 'paid', issued: 'Mar 28', due: 'Apr 7' },
  { id: 'INV-1036', client: 'c5', amount: 3200, status: 'paid', issued: 'Mar 24', due: 'Apr 3' },
  { id: 'INV-1035', client: 'c1', amount: 4500, status: 'paid', issued: 'Mar 18', due: 'Mar 28' },
];

const PROPOSALS = [
  { id: 'P-208', client: 'c6', title: 'Brand refresh', value: 14500, status: 'viewed', sent: 'Apr 22', views: 6 },
  { id: 'P-207', client: 'c8', title: 'Website v3', value: 28000, status: 'sent', sent: 'Apr 25', views: 1 },
  { id: 'P-206', client: 'c1', title: 'Q2 site relaunch', value: 14500, status: 'signed', sent: 'Apr 14', views: 12 },
  { id: 'P-205', client: 'c4', title: 'Campaign site', value: 9800, status: 'viewed', sent: 'Apr 19', views: 3 },
  { id: 'P-204', client: 'c5', title: 'Q3 expansion', value: 24000, status: 'draft', sent: '—', views: 0 },
  { id: 'P-203', client: 'c7', title: 'Q2 retainer', value: 18000, status: 'signed', sent: 'Apr 1', views: 8 },
];

const TODAY_TIMELINE = [
  { time: '9:00', title: 'Daily standup', team: ['u1', 'u2', 'u3', 'u4'], type: 'meeting' },
  { time: '10:30', title: 'Acme · Q2 site review', team: ['u1', 'u2'], type: 'meeting', client: 'c1' },
  { time: '12:00', title: 'Lunch', type: 'block' },
  { time: '14:00', title: 'Deep work · Halstead identity', type: 'focus' },
  { time: '15:00', title: 'Diego 1:1', team: ['u2'], type: 'meeting' },
  { time: '16:30', title: 'Bywater proposal review', team: ['u1'], type: 'meeting', client: 'c6' },
];

const AUTOMATIONS = [
  { id: 'a1', name: 'New deal won → kickoff', trigger: 'Deal stage = Won', actions: 6, runs: 142, on: true },
  { id: 'a2', name: 'Invoice 5d overdue → chase', trigger: 'Invoice overdue 5+ days', actions: 3, runs: 38, on: true },
  { id: 'a3', name: 'Form submit → create lead', trigger: 'Form submitted', actions: 4, runs: 211, on: true },
  { id: 'a4', name: 'Proposal viewed 3× → notify', trigger: 'Proposal viewed ≥ 3 times', actions: 2, runs: 24, on: true },
  { id: 'a5', name: 'Project complete → review request', trigger: 'Project marked complete', actions: 5, runs: 18, on: false },
];

const FORMS = [
  { id: 'f1', name: 'Contact us', subs: 142, conv: 38, paid: false, lastSub: '1h ago' },
  { id: 'f2', name: 'Discovery intake', subs: 64, conv: 22, paid: true, lastSub: '4h ago' },
  { id: 'f3', name: 'Newsletter', subs: 1842, conv: 12, paid: false, lastSub: '12m ago' },
  { id: 'f4', name: 'Project request', subs: 38, conv: 14, paid: true, lastSub: '2d ago' },
];

window.DASH_DATA = {
  ME, TEAM, CLIENTS, PIPELINE_STAGES, DEALS, PROJECTS, TASKS_BY_STATUS,
  INBOX_MESSAGES, INVOICES, PROPOSALS, TODAY_TIMELINE, AUTOMATIONS, FORMS,
};
