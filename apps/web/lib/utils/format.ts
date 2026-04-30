import { formatDistanceToNow } from 'date-fns';

export function relativeTime(date: Date | string | null | undefined): string {
  if (!date) return '—';
  const d = typeof date === 'string' ? new Date(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
}

export function fullName(parts: { firstName?: string | null; lastName?: string | null }): string {
  return [parts.firstName, parts.lastName].filter(Boolean).join(' ').trim();
}

export function initials(parts: {
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
}): string {
  const name = fullName(parts);
  if (name) {
    return name
      .split(/\s+/)
      .map((p) => p[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }
  return parts.email?.slice(0, 2).toUpperCase() ?? '??';
}
