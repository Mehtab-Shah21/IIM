import {describe, expect, it, vi} from 'vitest'

import {processLead, type Deps, type LeadPayload} from '@/lib/forms/process'

const now = new Date('2026-10-09T08:00:00Z')

function deps(overrides: Partial<Deps> = {}): Deps & {
  emails: Array<{to: string | string[]; subject: string; text: string}>
  logs: Array<Record<string, unknown>>
} {
  const emails: Array<{to: string | string[]; subject: string; text: string}> = []
  const logs: Array<Record<string, unknown>> = []
  return {
    now: () => now,
    serviceSlugs: ['plumbing-services-dubai'],
    serviceTitle: (s) => (s === 'plumbing-services-dubai' ? 'Plumbing Services' : s),
    verifyTurnstile: async () => true,
    turnstileRequired: true,
    newReference: () => 'IIM-261009-K7QX',
    sendWebhook: async () => ({ok: true}),
    sendEmail: async (e) => {
      emails.push(e)
      return true
    },
    ownerEmail: 'owner@example.com',
    business: {
      name: 'IIM Technical Services',
      phoneDisplay: '+971 50 962 6446',
      whatsappE164: '+971509626446',
      siteUrl: 'https://www.iimtechnicalservices.com',
    },
    log: (e) => logs.push(e),
    ...overrides,
    emails,
    logs,
  }
}

const quote = {
  type: 'quote',
  service: 'plumbing-services-dubai',
  description: 'Kitchen sink leaking under the cabinet',
  emirate: 'Dubai',
  area: 'Dubai Marina',
  preferredDate: '2026-10-11',
  preferredTime: 'morning',
  name: 'Test Person',
  phone: '050 123 4567',
  email: 'customer@example.com',
  consent: 'on',
  website: '',
  startedAt: String(now.getTime() - 60_000),
  turnstileToken: 'token',
  pageUrl: 'https://www.iimtechnicalservices.com/services/plumbing-services-dubai/',
}

describe('processLead', () => {
  it('delivers a valid quote: webhook, owner email, customer email', async () => {
    const webhook = vi.fn(async (_payload: LeadPayload) => ({ok: true}))
    const d = deps({sendWebhook: webhook})
    const r = await processLead(quote, d)
    expect(r).toEqual({
      status: 'ok',
      ref: 'IIM-261009-K7QX',
      type: 'quote',
      delivered: {webhook: true, ownerEmail: true, customerEmail: true},
    })
    const payload = webhook.mock.calls[0]![0]
    expect(payload).toMatchObject({
      ref: 'IIM-261009-K7QX',
      type: 'quote',
      phone: '+971501234567',
      service: 'plumbing-services-dubai',
      emirate: 'Dubai',
    })
    expect(d.emails[0]!.subject).toMatch(/^New quote request IIM-261009-K7QX/)
    expect(d.emails[1]!.to).toBe('customer@example.com')
  })

  it('never logs personal data', async () => {
    const d = deps()
    await processLead(quote, d)
    const logged = JSON.stringify(d.logs)
    expect(logged).not.toContain('050')
    expect(logged).not.toContain('Test Person')
    expect(logged).not.toContain('customer@example.com')
  })

  it('still emails the owner, flagged, when the webhook fails', async () => {
    const d = deps({sendWebhook: async () => ({ok: false, error: 'HTTP 500'})})
    const r = await processLead(quote, d)
    expect(r.status).toBe('ok')
    expect(d.emails[0]!.subject.startsWith('[WEBHOOK FAILED] ')).toBe(true)
  })

  it('returns undeliverable (never drops silently) when webhook and owner email both fail', async () => {
    const d = deps({
      sendWebhook: async () => ({ok: false, error: 'timeout'}),
      sendEmail: async () => false,
    })
    expect((await processLead(quote, d)).status).toBe('undeliverable')
  })

  it('pretends success for the honeypot and delivers nothing', async () => {
    const webhook = vi.fn(async (_payload: LeadPayload) => ({ok: true}))
    const d = deps({sendWebhook: webhook})
    const r = await processLead({...quote, website: 'spam.example'}, d)
    expect(r.status).toBe('spam')
    expect(webhook).not.toHaveBeenCalled()
    expect(d.emails).toHaveLength(0)
  })

  it('rejects submissions made in under 3 seconds', async () => {
    const r = await processLead({...quote, startedAt: String(now.getTime() - 1000)}, deps())
    expect(r).toMatchObject({status: 'forbidden', reason: 'too_fast'})
  })

  it('rejects a failed Turnstile check', async () => {
    const r = await processLead(quote, deps({verifyTurnstile: async () => false}))
    expect(r).toMatchObject({status: 'forbidden', reason: 'turnstile'})
  })

  it('returns field errors for invalid input', async () => {
    const r = await processLead({...quote, phone: '123', description: 'x'}, deps())
    expect(r.status).toBe('invalid')
    if (r.status === 'invalid')
      expect(Object.keys(r.errors).sort()).toEqual(['description', 'phone'])
  })

  it('handles the annual contract application', async () => {
    const webhook = vi.fn(async (_payload: LeadPayload) => ({ok: true}))
    const d = deps({sendWebhook: webhook})
    const r = await processLead(
      {
        type: 'amc',
        name: 'Test Person',
        phone: '055 123 4567',
        emirate: 'Dubai',
        area: 'JLT',
        propertyType: 'office',
        plan: 'commercial',
        consent: 'on',
        startedAt: String(now.getTime() - 10_000),
        turnstileToken: 't',
      },
      d,
    )
    expect(r.status).toBe('ok')
    expect(webhook.mock.calls[0]![0]).toMatchObject({
      type: 'amc',
      propertyType: 'office',
      plan: 'commercial',
      phone: '+971551234567',
    })
    expect(d.emails).toHaveLength(1) // no customer email field on the AMC form
  })
})
