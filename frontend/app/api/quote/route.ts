/**
 * POST /api/quote: quote and annual-contract submissions.
 * Accepts application/x-www-form-urlencoded (works without JavaScript) and returns JSON for
 * fetch() clients or a 303 redirect for plain form posts. Never cached.
 */
import {type NextRequest, NextResponse} from 'next/server'

import {getServices, getSettings} from '@/lib/content'
import {getServerEnv, siteUrl} from '@/lib/env'
import {processLead, type LeadResult} from '@/lib/forms/process'
import {newReference} from '@/lib/forms/reference'
import {sendWebhook} from '@/lib/forms/webhook'
import {sendEmail} from '@/lib/mail/send'
import {clientIp, RateLimiter} from '@/lib/security/rate-limit'
import {verifyTurnstile} from '@/lib/security/turnstile'

export const dynamic = 'force-dynamic'

const MAX_BYTES = 32 * 1024
const limiter = new RateLimiter(5, 60 * 60 * 1000)

const log = (event: Record<string, unknown>) => console.info(JSON.stringify({ts: new Date().toISOString(), ...event}))

function allowedOrigin(req: NextRequest): boolean {
  const origin = req.headers.get('origin')
  if (!origin) return false
  const own = new URL(req.url).origin
  const forwardedHost = req.headers.get('x-forwarded-host')
  const forwarded = forwardedHost ? `${req.headers.get('x-forwarded-proto') ?? 'https'}://${forwardedHost}` : null
  return [own, siteUrl, forwarded].filter(Boolean).includes(origin)
}

export async function POST(req: NextRequest) {
  const wantsJson = (req.headers.get('accept') ?? '').includes('application/json')

  if (!allowedOrigin(req)) {
    log({event: 'lead_rejected', reason: 'origin'})
    return respond(wantsJson, {status: 'forbidden', type: 'quote', reason: 'origin'}, req)
  }
  if (!(req.headers.get('content-type') ?? '').startsWith('application/x-www-form-urlencoded')) {
    return NextResponse.json({ok: false, message: 'Unsupported content type.'}, {status: 415})
  }
  const length = Number(req.headers.get('content-length') ?? 0)
  if (length > MAX_BYTES) return NextResponse.json({ok: false, message: 'Request too large.'}, {status: 413})

  const bodyText = await req.text()
  if (bodyText.length > MAX_BYTES) return NextResponse.json({ok: false, message: 'Request too large.'}, {status: 413})

  const ip = clientIp(req.headers)
  const rate = limiter.check(ip)
  if (!rate.allowed) {
    log({event: 'lead_rejected', reason: 'rate_limit'})
    const message = 'Too many requests from your connection. Please message us on WhatsApp instead.'
    return wantsJson
      ? NextResponse.json({ok: false, message}, {status: 429, headers: {'Retry-After': String(rate.retryAfterSeconds)}})
      : NextResponse.redirect(new URL('/get-a-quote/?error=rate', req.url), 303)
  }

  const raw = Object.fromEntries(new URLSearchParams(bodyText))
  const env = getServerEnv()
  const [settings, services] = await Promise.all([getSettings(), getServices()])
  const titles = new Map(services.map((s) => [s.slug ?? '', s.title ?? '']))

  const result = await processLead(raw, {
    now: () => new Date(),
    serviceSlugs: services.map((s) => s.slug).filter((s): s is string => Boolean(s)),
    serviceTitle: (slug) => titles.get(slug) || (slug === 'other' ? 'Something else' : slug),
    verifyTurnstile: (token) => verifyTurnstile(env.TURNSTILE_SECRET_KEY ?? '', token, ip),
    turnstileRequired: Boolean(env.TURNSTILE_SECRET_KEY),
    newReference: () => newReference(),
    sendWebhook:
      env.LEAD_WEBHOOK_URL && env.LEAD_WEBHOOK_SECRET
        ? (payload) => sendWebhook(env.LEAD_WEBHOOK_URL!, env.LEAD_WEBHOOK_SECRET!, payload)
        : null,
    sendEmail,
    ownerEmail: env.OWNER_EMAIL,
    business: {
      name: settings.businessName ?? 'IIM Technical Services',
      phoneDisplay: settings.phoneDisplay ?? '',
      whatsappE164: settings.whatsappE164 ?? '',
      siteUrl,
    },
    log,
  })

  return respond(wantsJson, result, req)
}

function respond(wantsJson: boolean, result: LeadResult, req: NextRequest) {
  const headers = {'Cache-Control': 'no-store'}
  switch (result.status) {
    case 'ok':
    case 'spam': {
      const redirect = `/thank-you/?ref=${encodeURIComponent(result.ref)}&type=${result.type}`
      return wantsJson
        ? NextResponse.json({ok: true, ref: result.ref, redirect}, {headers})
        : NextResponse.redirect(new URL(redirect, req.url), {status: 303, headers})
    }
    case 'invalid':
      return wantsJson
        ? NextResponse.json({ok: false, message: 'Please check the highlighted fields.', errors: result.errors}, {status: 400, headers})
        : NextResponse.redirect(
            new URL(`/get-a-quote/?type=${result.type}&errors=${encodeURIComponent(Object.keys(result.errors).join(','))}#form`, req.url),
            {status: 303, headers},
          )
    case 'forbidden': {
      const message =
        result.reason === 'too_fast'
          ? 'That was very quick. Please check your details and send again.'
          : result.reason === 'turnstile'
            ? 'The spam check did not pass. Please try again, or message us on WhatsApp.'
            : 'Your session expired. Please reload the page and try again.'
      return wantsJson
        ? NextResponse.json({ok: false, message}, {status: 403, headers})
        : NextResponse.redirect(new URL(`/get-a-quote/?type=${result.type}&error=${result.reason}#form`, req.url), {status: 303, headers})
    }
    case 'undeliverable':
      return wantsJson
        ? NextResponse.json(
            {
              ok: false,
              ref: result.ref,
              message: 'We could not send your request right now. Please call or WhatsApp us and quote your reference.',
            },
            {status: 503, headers},
          )
        : NextResponse.redirect(new URL(`/get-a-quote/?error=delivery&ref=${encodeURIComponent(result.ref)}#form`, req.url), {status: 303, headers})
  }
}
