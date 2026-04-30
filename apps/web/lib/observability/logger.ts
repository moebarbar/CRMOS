import 'server-only';

type Level = 'debug' | 'info' | 'warn' | 'error';

interface LogPayload {
  level: Level;
  message: string;
  meta?: Record<string, unknown>;
  ts: string;
}

const AXIOM_URL = process.env.AXIOM_TOKEN && process.env.AXIOM_DATASET
  ? `https://api.axiom.co/v1/datasets/${process.env.AXIOM_DATASET}/ingest`
  : null;

async function ship(payload: LogPayload) {
  if (!AXIOM_URL) return;
  try {
    await fetch(AXIOM_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.AXIOM_TOKEN!}`,
        'Content-Type': 'application/x-ndjson',
      },
      body: JSON.stringify(payload) + '\n',
      // best-effort; never block the request path
      keepalive: true,
    });
  } catch {
    // swallow — observability must never break user flow
  }
}

function emit(level: Level, message: string, meta?: Record<string, unknown>) {
  const payload: LogPayload = { level, message, meta, ts: new Date().toISOString() };
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    const fn = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
    fn(`[${level}] ${message}`, meta ?? '');
  }
  void ship(payload);
}

export const log = {
  debug: (m: string, meta?: Record<string, unknown>) => emit('debug', m, meta),
  info: (m: string, meta?: Record<string, unknown>) => emit('info', m, meta),
  warn: (m: string, meta?: Record<string, unknown>) => emit('warn', m, meta),
  error: (m: string, meta?: Record<string, unknown>) => emit('error', m, meta),
};