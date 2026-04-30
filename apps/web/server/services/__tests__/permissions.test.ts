import { describe, expect, it } from 'vitest';
import { canByRole } from '@/lib/auth/permissions';

describe('canByRole', () => {
  it('owners can do anything', () => {
    expect(canByRole('OWNER', 'workspace:delete')).toBe(true);
    expect(canByRole('OWNER', 'workspace:billing')).toBe(true);
  });

  it('admins are blocked from billing + delete', () => {
    expect(canByRole('ADMIN', 'workspace:update')).toBe(true);
    expect(canByRole('ADMIN', 'workspace:billing')).toBe(false);
    expect(canByRole('ADMIN', 'workspace:delete')).toBe(false);
  });

  it('members cannot invite', () => {
    expect(canByRole('MEMBER', 'workspace:read')).toBe(true);
    expect(canByRole('MEMBER', 'members:invite')).toBe(false);
  });

  it('clients are read-only', () => {
    expect(canByRole('CLIENT', 'workspace:read')).toBe(true);
    expect(canByRole('CLIENT', 'workspace:update')).toBe(false);
  });
});
