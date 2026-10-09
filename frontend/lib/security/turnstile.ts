/** Server-side Cloudflare Turnstile verification. */
export async function verifyTurnstile(
  secret: string,
  token: string,
  ip?: string,
  fetchImpl: typeof fetch = fetch,
): Promise<boolean> {
  if (!token) return false
  try {
    const body = new URLSearchParams({secret, response: token})
    if (ip && ip !== 'unknown') body.set('remoteip', ip)
    const res = await fetchImpl('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body,
      signal: AbortSignal.timeout(5000),
      cache: 'no-store',
    })
    const data = (await res.json()) as {success?: boolean}
    return data.success === true
  } catch {
    return false
  }
}
