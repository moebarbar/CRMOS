import type { Membership, Role } from '@chiefos/db';

/**
 * Coarse RBAC. Module-specific tools layer on top with their own checks.
 * Owner can do anything. Admin can do anything except the listed blocked actions.
 * Member has a curated allowlist. Contractor is project-scoped. Client is portal-scoped.
 */

export type Action =
  | 'workspace:read'
  | 'workspace:update'
  | 'workspace:delete'
  | 'workspace:billing'
  | 'members:invite'
  | 'members:remove'
  | 'members:update'
  | 'apikeys:manage';

const ADMIN_BLOCKED: ReadonlySet<Action> = new Set<Action>([
  'workspace:delete',
  'workspace:billing',
]);

const MEMBER_ALLOWED: ReadonlySet<Action> = new Set<Action>(['workspace:read']);

const CONTRACTOR_ALLOWED: ReadonlySet<Action> = new Set<Action>(['workspace:read']);

const CLIENT_ALLOWED: ReadonlySet<Action> = new Set<Action>(['workspace:read']);

export function canByRole(role: Role, action: Action): boolean {
  if (role === 'OWNER') return true;
  if (role === 'ADMIN') return !ADMIN_BLOCKED.has(action);
  if (role === 'MEMBER') return MEMBER_ALLOWED.has(action);
  if (role === 'CONTRACTOR') return CONTRACTOR_ALLOWED.has(action);
  if (role === 'CLIENT') return CLIENT_ALLOWED.has(action);
  // CUSTOM falls through to permission-string checks at the call site.
  return false;
}

export function can(membership: Pick<Membership, 'role'>, action: Action): boolean {
  return canByRole(membership.role, action);
}
