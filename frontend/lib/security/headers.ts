/**
 * Security headers and the Content Security Policy (see docs/DECISIONS.md ADR-003).
 * Pure functions so they can be unit-tested and used from next.config.ts.
 */

export type CspOptions = {
  /** Sanity Studio origin, allowed to frame the site for the Presentation tool. */
  studioUrl?: string
  /** Allow inline scripts (fallback when SRI alone cannot cover Next.js inline data scripts). */
  allowInlineScripts: boolean
  isDev: boolean
}

function origin(url?: string): string | undefined {
  if (!url) return undefined
  try {
    return new URL(url).origin
  } catch {
    return undefined
  }
}

export function buildCsp({studioUrl, allowInlineScripts, isDev}: CspOptions): string {
  const studio = origin(studioUrl)
  const directives: Record<string, string[]> = {
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      ...(allowInlineScripts ? ["'unsafe-inline'"] : []),
      ...(isDev ? ["'unsafe-eval'"] : []),
      'https://challenges.cloudflare.com',
      'https://www.googletagmanager.com',
    ],
    'style-src': ["'self'", "'unsafe-inline'"],
    'img-src': [
      "'self'",
      'data:',
      'blob:',
      'https://cdn.sanity.io',
      'https://www.google-analytics.com',
    ],
    'font-src': ["'self'"],
    'connect-src': [
      "'self'",
      'https://*.api.sanity.io',
      'https://*.apicdn.sanity.io',
      'wss://*.api.sanity.io',
      'https://challenges.cloudflare.com',
      'https://*.google-analytics.com',
      'https://*.analytics.google.com',
      ...(isDev ? ['ws:'] : []),
    ],
    'frame-src': ['https://challenges.cloudflare.com'],
    'frame-ancestors': ["'self'", ...(studio ? [studio] : [])],
    'form-action': ["'self'"],
    'base-uri': ["'self'"],
    'object-src': ["'none'"],
    'worker-src': ["'self'", 'blob:'],
    'manifest-src': ["'self'"],
  }
  const parts = Object.entries(directives).map(([k, v]) => `${k} ${v.join(' ')}`)
  if (!isDev) parts.push('upgrade-insecure-requests')
  return parts.join('; ')
}

export type Header = {key: string; value: string}

export function securityHeaders(opts: CspOptions & {cspMode: 'report-only' | 'enforce'}): Header[] {
  // Browsers ignore upgrade-insecure-requests in a Report-Only policy and log a console error
  // saying so; send it only when the policy is enforced.
  const csp =
    opts.cspMode === 'enforce'
      ? buildCsp(opts)
      : buildCsp(opts).replace('; upgrade-insecure-requests', '')
  return [
    {
      key:
        opts.cspMode === 'enforce'
          ? 'Content-Security-Policy'
          : 'Content-Security-Policy-Report-Only',
      value: csp,
    },
    {key: 'X-Content-Type-Options', value: 'nosniff'},
    {key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin'},
    {
      key: 'Permissions-Policy',
      value:
        'camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=(), browsing-topics=()',
    },
    {key: 'Cross-Origin-Opener-Policy', value: 'same-origin'},
    {key: 'X-DNS-Prefetch-Control', value: 'on'},
  ]
}
