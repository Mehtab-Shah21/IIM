import {signPayload} from '@/lib/security/hmac'

export type WebhookResult = {ok: true; attempts: number} | {ok: false; attempts: number; error: string}

/**
 * POSTs the lead to Make/n8n with X-IIM-Timestamp and X-IIM-Signature headers.
 * Retries up to 3 times with backoff (300 ms, 900 ms) and a 5 s timeout per attempt.
 */
export async function sendWebhook(
  url: string,
  secret: string,
  payload: unknown,
  {fetchImpl = fetch, sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))}: {fetchImpl?: typeof fetch; sleep?: (ms: number) => Promise<void>} = {},
): Promise<WebhookResult> {
  const body = JSON.stringify(payload)
  let lastError = 'unknown'
  for (let attempt = 1; attempt <= 3; attempt++) {
    const timestamp = String(Math.floor(Date.now() / 1000))
    try {
      const res = await fetchImpl(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-IIM-Timestamp': timestamp,
          'X-IIM-Signature': signPayload(secret, timestamp, body),
        },
        body,
        signal: AbortSignal.timeout(5000),
        cache: 'no-store',
      })
      if (res.ok) return {ok: true, attempts: attempt}
      lastError = `HTTP ${res.status}`
    } catch (err) {
      lastError = err instanceof Error ? err.name : 'network error'
    }
    if (attempt < 3) await sleep(300 * 3 ** (attempt - 1))
  }
  return {ok: false, attempts: 3, error: lastError}
}
