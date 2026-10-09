import type {APIRequestContext} from '@playwright/test'

/** Every template, with one representative URL each. */
export const templates = [
  '/',
  '/services/',
  '/services/plumbing-services-dubai/',
  '/annual-maintenance-contract/',
  '/annual-maintenance-contract/residential/',
  '/areas/',
  '/projects/',
  '/guides/',
  '/about/',
  '/reviews/',
  '/faq/',
  '/contact/',
  '/get-a-quote/',
  '/thank-you/?ref=IIM-261009-K7QX',
  '/accessibility/',
  '/style-guide/',
  '/this-page-does-not-exist/',
]

/** Indexable pages (SEO checks). */
export const indexable = [
  '/',
  '/services/',
  '/services/electrical-services-dubai/',
  '/services/plumbing-services-dubai/',
  '/services/ac-services-dubai/',
  '/services/painting-services-dubai/',
  '/services/handyman-services-dubai/',
  '/services/home-renovation-dubai/',
  '/services/emergency-electrician-plumber-dubai/',
  '/annual-maintenance-contract/',
  '/annual-maintenance-contract/residential/',
  '/annual-maintenance-contract/commercial/',
  '/about/',
  '/faq/',
  '/contact/',
  '/get-a-quote/',
  '/accessibility/',
]

export const widths = [320, 360, 390, 768, 1024, 1280, 1440, 1920]

/** A unique fake client IP per test, so the 5-per-hour rate limit does not leak between tests. */
export function ipHeader(): Record<string, string> {
  const n = () => Math.floor(Math.random() * 250) + 1
  return {'cf-connecting-ip': `10.${n()}.${n()}.${n()}`}
}

export function tomorrow(): string {
  const d = new Date(Date.now() + 36 * 3600 * 1000)
  return new Intl.DateTimeFormat('en-CA', {timeZone: 'Asia/Dubai'}).format(d)
}

/** A form body that passes validation (startedAt in the past to pass the timing check). */
export function quoteBody(overrides: Record<string, string> = {}): string {
  return new URLSearchParams({
    type: 'quote',
    service: 'plumbing-services-dubai',
    description: 'Kitchen sink leaking under the cabinet (E2E TEST)',
    emirate: 'Dubai',
    area: 'Dubai Marina',
    address: '',
    preferredDate: tomorrow(),
    preferredTime: 'morning',
    name: 'E2E Tester',
    phone: '050 123 4567',
    email: '',
    consent: 'on',
    website: '',
    startedAt: String(Date.now() - 30_000),
    pageUrl: 'http://localhost:3100/get-a-quote/',
    ...overrides,
  }).toString()
}

export async function postLead(
  request: APIRequestContext,
  body: string,
  extra: Record<string, string> = {},
) {
  return request.post('/api/quote/', {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
      Origin: 'http://localhost:3100',
      ...ipHeader(),
      ...extra,
    },
    data: body,
    maxRedirects: 0,
  })
}
