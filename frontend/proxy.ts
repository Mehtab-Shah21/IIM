/**
 * Runs before every page request (Next.js 16 "proxy", formerly middleware):
 * 1. Staging: HTTP Basic Auth and X-Robots-Tag noindex.
 * 2. Apex → https://www (Cloudflare does this too; this is the backstop).
 * 3. Redirects managed in Sanity (60 s cache), including 410 Gone.
 */
import {type NextRequest, NextResponse} from 'next/server'

import {matchRedirect, normalisePath} from '@/lib/redirects/matcher'
import {getRoutingData, isMissingContent} from '@/lib/redirects/source'

const CANONICAL_HOST = 'www.iimtechnicalservices.com'

const goneHtml =
  '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Page removed | IIM Technical Services</title></head><body style="font-family:system-ui,sans-serif;padding:32px;line-height:1.6"><h1>This page has been removed</h1><p><a href="/">Go to the IIM Technical Services homepage</a></p></body></html>'

function unauthorized() {
  return new NextResponse('Authentication required', {
    status: 401,
    headers: {'WWW-Authenticate': 'Basic realm="IIM staging", charset="UTF-8"', 'X-Robots-Tag': 'noindex, nofollow'},
  })
}

export async function proxy(req: NextRequest) {
  const siteEnv = process.env.SITE_ENV
  const url = req.nextUrl

  if (siteEnv === 'staging') {
    const expected = process.env.STAGING_BASIC_AUTH
    if (expected) {
      const header = req.headers.get('authorization') ?? ''
      const given = header.startsWith('Basic ') ? Buffer.from(header.slice(6), 'base64').toString() : ''
      if (given !== expected) return unauthorized()
    }
  }

  // Client navigations (RSC payload requests) only need the auth check above: redirects and the
  // trailing-slash rule apply to real page loads, and Next rewrites RSC paths internally.
  if (req.headers.get('rsc') === '1') return NextResponse.next()

  if (siteEnv === 'production' && req.headers.get('host') === 'iimtechnicalservices.com') {
    return NextResponse.redirect(`https://${CANONICAL_HOST}${url.pathname}${url.search}`, 301)
  }

  const routing = await getRoutingData()
  const hit = routing ? matchRedirect(routing.redirects, url.pathname) : null
  if (hit) {
    if (hit.status === 410) {
      return new NextResponse(goneHtml, {
        status: 410,
        headers: {'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=3600'},
      })
    }
    const dest = /^https?:\/\//.test(hit.to!) ? hit.to! : new URL(hit.to!, req.url).toString()
    return NextResponse.redirect(dest, hit.status)
  }

  // Canonical trailing slash (Next's own redirect is disabled; see next.config.ts).
  if (!url.pathname.endsWith('/') && !/\.[a-z0-9]+$/i.test(url.pathname)) {
    const dest = new URL(req.url)
    dest.pathname = `${dest.pathname}/`
    return NextResponse.redirect(dest.toString(), 308)
  }

  // Unknown slugs and unpublished pages: rewrite to an unmatched path so Next.js serves its
  // fully server-rendered 404 (see lib/redirects/source.ts for why).
  if (routing && isMissingContent(routing, normalisePath(url.pathname))) {
    const res = NextResponse.rewrite(new URL('/__not-found__/', req.url))
    if (siteEnv !== 'production') res.headers.set('X-Robots-Tag', 'noindex, nofollow')
    return res
  }

  const res = NextResponse.next()
  if (siteEnv !== 'production') res.headers.set('X-Robots-Tag', 'noindex, nofollow')
  return res
}

export const config = {
  matcher: [
    {
      source: '/((?!_next/static|_next/image|api/|favicon.ico|opengraph-image|icon|apple-icon|robots.txt|sitemap.xml).*)',
      missing: [
        {type: 'header', key: 'next-router-prefetch'},
        {type: 'header', key: 'purpose', value: 'prefetch'},
      ],
    },
  ],
}
