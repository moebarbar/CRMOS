import 'server-only';
import { prisma } from '@/lib/db/prisma';

/**
 * Resolve a workspace by slug from a hostname or path segment.
 * Phase 0: slug-from-path only. Phase 8 (custom domains) extends this
 * to look up `WorkspaceDomain.hostname`.
 */
export async function resolveWorkspaceBySlug(slug: string) {
  return prisma.workspace.findFirst({
    where: { slug, deletedAt: null },
    select: { id: true, slug: true, name: true, brandPrimary: true, brandAccent: true },
  });
}
