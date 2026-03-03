import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { locales, defaultLocale } from './lib/i18n';

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
});

// Public routes that don't need auth check
const PUBLIC_PATTERNS = [
  /^\/[a-z]{2}\/login/,
  /^\/[a-z]{2}\/menu\//,
  /^\/[a-z]{2}\/cart/,
  /^\/[a-z]{2}\/order\//,
  /^\/[a-z]{2}\/payment\//,
];

export default function middleware(req: NextRequest) {
  return intlMiddleware(req);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
