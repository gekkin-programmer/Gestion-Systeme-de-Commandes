import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Restaurant Commandes',
  description: 'Plateforme de commandes digitales pour restaurants',
  manifest: '/manifest.json',
  themeColor: '#f97316',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  icons: [
    { rel: 'icon', url: '/favicon.ico' },
    { rel: 'apple-touch-icon', url: '/icon-192.png' },
  ],
};

// html/body live here as Next.js requires them in the root layout.
// The [locale]/layout.tsx sets lang via suppressHydrationWarning.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
