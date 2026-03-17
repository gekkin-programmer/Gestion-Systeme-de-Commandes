import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/lib/i18n.ts');

const API_URL  = process.env.NEXT_PUBLIC_API_URL  ?? 'http://localhost:4000';
const SOCK_URL = process.env.NEXT_PUBLIC_SOCKET_URL ?? 'http://localhost:4000';

// Extract origins for CSP (strip paths)
function origin(url) {
  try { return new URL(url).origin; } catch { return url; }
}

const apiOrigin  = origin(API_URL);
const sockOrigin = origin(SOCK_URL);

const securityHeaders = [
  // Prevent clickjacking
  { key: 'X-Frame-Options', value: 'DENY' },
  // Prevent MIME sniffing
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Referrer policy — no referrer on cross-origin
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Disable FLoC / interest-cohort tracking
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  // Content Security Policy
  {
    key: 'Content-Security-Policy',
    value: [
      // Only load scripts from same origin (Next.js nonces not needed in this setup)
      "default-src 'self'",
      // Allow Next.js inline scripts + eval for dev HMR; restrict in prod via env
      `script-src 'self' 'unsafe-inline' 'unsafe-eval'`,
      // Styles: self + Google Fonts + inline (CSS-in-JS / CSS modules)
      `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
      // Fonts: self + Google Fonts CDN
      `font-src 'self' https://fonts.gstatic.com`,
      // Images: self + Cloudinary + Unsplash + data URIs (QR codes)
      `img-src 'self' data: blob: https://res.cloudinary.com https://images.unsplash.com ${apiOrigin}`,
      // API + Socket.io connections + agentation dev tool
      `connect-src 'self' ${apiOrigin} ${sockOrigin}${process.env.NODE_ENV === 'development' ? ' http://localhost:4747' : ''}`,
      // No plugins (PDF is opened in new tab or downloaded)
      "object-src 'none'",
      // Restrict frames
      "frame-ancestors 'none'",
      // upgrade-insecure-requests: only enable when SSL is configured
      // ...(process.env.NODE_ENV === 'production' ? ['upgrade-insecure-requests'] : []),
    ].join('; '),
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  webpack(config, { dev }) {
    if (!dev) {
      // agentation is a dev-only tool — stub it out so production builds don't fail
      config.resolve.alias['agentation'] = false;
    }
    return config;
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'http',  hostname: 'localhost', port: '4000' },
      { protocol: 'http',  hostname: '72.60.214.93', port: '4000' },
    ],
  },
  async headers() {
    return [
      {
        // Apply to all routes
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
