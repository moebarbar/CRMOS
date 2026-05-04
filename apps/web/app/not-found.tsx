import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <div>
        <p className="text-muted-foreground text-sm font-medium">404</p>
        <h1 className="text-3xl font-semibold tracking-tight">Not found</h1>
        <p className="text-muted-foreground mt-2 max-w-md text-sm">
          That workspace or page doesn&apos;t exist, or you don&apos;t have access.
        </p>
      </div>
      <Button asChild>
        <Link href="/">Back home</Link>
      </Button>
    </main>
  );
}
