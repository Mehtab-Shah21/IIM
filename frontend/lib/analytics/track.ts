/**
 * Analytics events (CLAUDE.md §16): quote_submit, amc_submit, whatsapp_click, phone_click, cta_click.
 * Sends to GA4 when it has loaded; otherwise queues in dataLayer. Never sends personal data.
 */
export type TrackEvent = 'quote_submit' | 'amc_submit' | 'whatsapp_click' | 'phone_click' | 'cta_click'

type Gtag = (command: 'event' | 'js' | 'config', target: string | Date, params?: Record<string, unknown>) => void

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: Gtag
  }
}

export function track(event: TrackEvent, params: Record<string, string | number | undefined> = {}) {
  if (typeof window === 'undefined') return
  if (window.gtag) window.gtag('event', event, params)
  else (window.dataLayer ??= []).push({event, ...params})
}
