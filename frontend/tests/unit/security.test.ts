import {describe, expect, it} from 'vitest'

import {newReference, REFERENCE_PATTERN} from '@/lib/forms/reference'
import {buildCsp, securityHeaders} from '@/lib/security/headers'
import {signPayload, verifySignature} from '@/lib/security/hmac'
import {clientIp, RateLimiter} from '@/lib/security/rate-limit'

describe('reference', () => {
  it('has the IIM-YYMMDD-XXXX format in Dubai time', () => {
    const ref = newReference(new Date('2026-10-09T21:00:00Z'))
    expect(ref).toMatch(REFERENCE_PATTERN)
    expect(ref.startsWith('IIM-261010-')).toBe(true)
  })
  it('never uses ambiguous letters', () => {
    for (let i = 0; i < 200; i++) expect(newReference().slice(-4)).not.toMatch(/[ILOU]/)
  })
  it('retries on collision', () => {
    let calls = 0
    const ref = newReference(new Date(), () => ++calls === 1)
    expect(calls).toBe(2)
    expect(ref).toMatch(REFERENCE_PATTERN)
  })
})

describe('HMAC signing', () => {
  const secret = 'test-secret'
  const ts = '1791547200'
  const body = '{"ref":"IIM-261009-K7QX"}'
  const now = 1_791_547_200_000

  it('round-trips', () => {
    const sig = signPayload(secret, ts, body)
    expect(sig).toMatch(/^sha256=[0-9a-f]{64}$/)
    expect(verifySignature(secret, ts, body, sig, {now})).toBe(true)
  })
  it('rejects a tampered body, a wrong secret or an old timestamp', () => {
    const sig = signPayload(secret, ts, body)
    expect(verifySignature(secret, ts, `${body} `, sig, {now})).toBe(false)
    expect(verifySignature('other', ts, body, sig, {now})).toBe(false)
    expect(verifySignature(secret, ts, body, sig, {now: now + 6 * 60_000})).toBe(false)
  })
})

describe('rate limiter', () => {
  it('allows 5 per hour per key, then blocks until the window passes', () => {
    const rl = new RateLimiter(5, 3_600_000)
    const t = 1_000_000
    for (let i = 0; i < 5; i++) expect(rl.check('1.2.3.4', t + i).allowed).toBe(true)
    const blocked = rl.check('1.2.3.4', t + 10)
    expect(blocked.allowed).toBe(false)
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0)
    expect(rl.check('5.6.7.8', t + 10).allowed).toBe(true)
    expect(rl.check('1.2.3.4', t + 3_600_001).allowed).toBe(true)
  })
  it('reads the client IP from Cloudflare first', () => {
    expect(
      clientIp(new Headers({'cf-connecting-ip': '9.9.9.9', 'x-forwarded-for': '1.1.1.1'})),
    ).toBe('9.9.9.9')
    expect(clientIp(new Headers({'x-forwarded-for': '1.1.1.1, 2.2.2.2'}))).toBe('1.1.1.1')
  })
})

describe('CSP and headers', () => {
  it('is strict apart from the documented exceptions', () => {
    const csp = buildCsp({
      studioUrl: 'https://iim.sanity.studio/',
      allowInlineScripts: false,
      isDev: false,
    })
    expect(csp).toContain("default-src 'self'")
    expect(csp).toContain("object-src 'none'")
    expect(csp).toContain("frame-ancestors 'self' https://iim.sanity.studio")
    expect(csp).not.toContain("'unsafe-eval'")
    expect(csp).not.toMatch(/script-src[^;]*'unsafe-inline'/)
  })
  it('switches between report-only and enforce', () => {
    const base = {allowInlineScripts: true, isDev: false}
    expect(securityHeaders({...base, cspMode: 'report-only'})[0]!.key).toBe(
      'Content-Security-Policy-Report-Only',
    )
    expect(securityHeaders({...base, cspMode: 'enforce'})[0]!.key).toBe('Content-Security-Policy')
  })
})
