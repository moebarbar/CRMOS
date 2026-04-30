export const WORKSPACE_SLUG_REGEX = /^[a-z0-9](?:[a-z0-9-]{0,30}[a-z0-9])?$/;

export const RESERVED_WORKSPACE_SLUGS = new Set([
  'admin',
  'api',
  'app',
  'auth',
  'billing',
  'dashboard',
  'docs',
  'help',
  'login',
  'logout',
  'onboarding',
  'portal',
  'public',
  'settings',
  'sign-in',
  'sign-up',
  'status',
  'support',
  'webhooks',
  'www',
]);

export const ROLES = ['OWNER', 'ADMIN', 'MEMBER', 'CONTRACTOR', 'CLIENT', 'CUSTOM'] as const;
export type Role = (typeof ROLES)[number];
