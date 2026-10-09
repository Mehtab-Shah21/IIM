/**
 * In-memory sliding-window rate limit (5 requests per hour per IP). A backstop only: the
 * Cloudflare rate-limiting rule is the primary defence, and this resets on restart.
 * Works because Hostinger runs a single Node process.
 */
export class RateLimiter {
  private hits = new Map<string, number[]>()

  constructor(
    private readonly limit = 5,
    private readonly windowMs = 60 * 60 * 1000,
  ) {}

  /** Records a hit and returns whether it is allowed. */
  check(key: string, now: number = Date.now()): {allowed: boolean; retryAfterSeconds: number} {
    const since = now - this.windowMs
    const list = (this.hits.get(key) ?? []).filter((t) => t > since)
    if (list.length >= this.limit) {
      this.hits.set(key, list)
      return {allowed: false, retryAfterSeconds: Math.ceil((list[0]! + this.windowMs - now) / 1000)}
    }
    list.push(now)
    this.hits.set(key, list)
    if (this.hits.size > 10_000) this.prune(since)
    return {allowed: true, retryAfterSeconds: 0}
  }

  private prune(since: number) {
    for (const [k, v] of this.hits) if (!v.some((t) => t > since)) this.hits.delete(k)
  }
}

/** Client IP: Cloudflare's header first, then the proxy's. */
export function clientIp(headers: Headers): string {
  return (
    headers.get('cf-connecting-ip') ??
    headers.get('x-real-ip') ??
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    'unknown'
  )
}
