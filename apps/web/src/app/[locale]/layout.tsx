import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import Script from 'next/script';
import { OfflineBanner } from '@/components/shared/OfflineBanner';
import type { Locale } from '@/lib/i18n';

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: { locale: Locale };
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const messages = await getMessages();

  return (
    <html lang={params.locale}>
      <body>
        {/* Lordicon web component library */}
        <Script src="https://cdn.lordicon.com/lordicon.js" strategy="beforeInteractive" />
        <NextIntlClientProvider locale={params.locale} messages={messages}>
          <OfflineBanner />
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
