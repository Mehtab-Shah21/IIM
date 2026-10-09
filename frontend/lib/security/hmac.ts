import {createHmac, timingSafeEqual} from 'node:crypto'

/**
 * Webhook signing (CLAUDE.md §12): X-IIM-Signature = sha256=<hex HMAC of "<timestamp>.<raw body>">.
 * The receiver recomputes it and rejects timestamps older than 5 minutes.
 */
export function signPayload(secret: string, timestamp: string, body: string): string {
  return `sha256=${createHmac('sha256', secret).update(`${timestamp}.${body}`).digest('hex')}`
}

export function verifySignature(
  secret: string,
  timestamp: string,
  body: string,
  signature: string,
  {now = Date.now(), toleranceMs = 5 * 60_000}: {now?: number; toleranceMs?: number} = {},
): boolean {
  const ts = Number(timestamp)
  if (!Number.isFinite(ts) || Math.abs(now - ts * 1000) > toleranceMs) return false
  const expected = Buffer.from(signPayload(secret, timestamp, body))
  const given = Buffer.from(signature)
  return expected.length === given.length && timingSafeEqual(expected, given)
}
