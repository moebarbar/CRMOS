import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { ThemeProvider } from '@/components/theme-provider';
import { PostHogClient } from '@/components/observability/PostHogClient';
import { Toaster } from '@/components/ui/sonner';
import '@/styles/tokens.css';
import '@/styles/globals.css';
import '@/styles/dashboard.css';
import '@/styles/marketing.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans-next',
  display: 'swap',
});
const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono-next',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'CRMOS',
    template: '%s · CRMOS',
  },
  description:
    'CRMOS is the operating system for service businesses. Sales, delivery, billing, and an AI operator named Moe — in one workspace.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        suppressHydrationWarning
        className={`${inter.variable} ${mono.variable}`}
        // Initial theme — Tweaks panel can swap to .theme-dark later.
      >
        <body className="theme-light min-h-screen antialiased">
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
            {children}
            <Toaster />
            <PostHogClient />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
