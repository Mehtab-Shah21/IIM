/**
 * Contact links built from siteSettings (never hard-coded): tel: and wa.me click-to-chat links
 * with a page-specific prefilled message.
 */
export const digits = (value?: string | null) => (value ?? '').replace(/\D+/g, '')

export function telHref(e164?: string | null): string | null {
  const d = digits(e164)
  return d ? `tel:+${d}` : null
}

export function whatsappHref(e164: string | null | undefined, message: string): string | null {
  const d = digits(e164)
  return d ? `https://wa.me/${d}?text=${encodeURIComponent(message)}` : null
}

export const defaultWhatsappMessage = 'Hi IIM, I would like to book a service in Dubai.'

/** "Hi IIM, I need an electrician in Dubai." from a service's WhatsApp phrase. */
export function serviceWhatsappMessage(noun?: string | null, title?: string | null): string {
  return `Hi IIM, I need ${noun || title?.toLowerCase() || 'a technician'} in Dubai.`
}
