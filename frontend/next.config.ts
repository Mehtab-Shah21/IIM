import type {NextConfig} from 'next'

import {securityHeaders} from './lib/security/headers'

const isDev = process.env.NODE_ENV === 'development'

const nextConfig: NextConfig = {
  // URLs in the brief end with a slash (/services/, /about/ …).
  trailingSlash: true,
  // The proxy adds the trailing slash itself, after checking redirects, so old URLs such as
  // /about-us resolve in one hop instead of /about-us -> /about-us/ -> /about/.
  skipTrailingSlashRedirect: true,
  poweredByHeader: false,
  // Do not write AGENTS.md during `next dev` (CLAUDE.md is the project's agent guide).
  agentRules: false,
  reactStrictMode: true,
  images: {
    // CMS images are resized by Sanity's CDN, local images are pre-optimised:
    // Hostinger's CPU never resizes images.
    loader: 'custom',
    loaderFile: './lib/sanity/image-loader.ts',
  },
  experimental: {
    // Integrity hashes on every script chunk (ADR-003).
    sri: {algorithm: 'sha256'},
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders({
          studioUrl: process.env.NEXT_PUBLIC_SANITY_STUDIO_URL,
          // Next.js App Router streams page data in inline <script> tags, which SRI cannot hash.
          // Verified by tests/e2e/csp.spec.ts; see ADR-003.
          allowInlineScripts: process.env.CSP_ALLOW_INLINE_SCRIPTS !== 'false',
          isDev,
          cspMode: process.env.CSP_MODE === 'enforce' ? 'enforce' : 'report-only',
        }),
      },
      {
        source: '/api/:path*',
        headers: [{key: 'Cache-Control', value: 'no-store, max-age=0'}],
      },
    ]
  },
}

export default nextConfig
