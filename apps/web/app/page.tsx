import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function MarketingHome() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 px-6 py-24 text-center">
      <div className="space-y-3">
        <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
          ChiefOS
        </p>
        <h1 className="text-balance text-4xl font-semibold tracking-tight md:text-6xl">
          One app. Your whole business.
        </h1>
        <p className="mx-auto max-w-2xl text-balance text-muted-foreground md:text-lg">
          Replace 8–12 SaaS tools with one connected system. CRM, deals, projects, proposals,
          contracts, invoices, scheduling — and Moe, the AI that runs them by voice.
        </p>
      </div>
      <div className="flex gap-3">
        <Button asChild size="lg">
          <Link href="/sign-up">Start free</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/sign-in">Sign in</Link>
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Phase 0 build · marketing site lands later
      </p>
    </main>
  );
}