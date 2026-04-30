import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks/(.*)',
  '/api/inngest(.*)',
]);

const isOnboardingRoute = createRouteMatcher(['/onboarding(.*)']);

export default clerkMiddleware(async (auth, req) => {
  if (isPublicRoute(req)) return NextResponse.next();

  // Authed gate: any non-public route requires a signed-in user.
  const { userId, redirectToSignIn } = await auth();
  if (!userId) return redirectToSignIn();

  // Onboarding gate runs through; workspace gating is enforced inside
  // the (app)/[workspace]/layout.tsx via tRPC `workspaceProcedure`.
  if (isOnboardingRoute(req)) return NextResponse.next();

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip static assets + Next internals
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
    // Always run on API + tRPC
    '/(api|trpc)(.*)',
  ],
};
