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

// The [locale]/layout.tsx provides the <html lang> and <body> shell.
// This root layout is intentionally minimal (standard next-intl pattern).
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
