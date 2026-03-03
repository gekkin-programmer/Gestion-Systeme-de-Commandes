import { getRequestConfig } from 'next-intl/server';

export const locales = ['fr', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'fr';

export default getRequestConfig(async ({ locale }) => ({
  messages: (await import(`../../public/locales/${locale}/common.json`)).default,
}));
