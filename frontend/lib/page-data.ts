import {isIconName, type IconName} from '@/components/icons/Icon'
import type {ServiceCard, Settings} from '@/lib/content'
import {telHref, whatsappHref} from '@/lib/contact'
import {publicEnv} from '@/lib/env'

/** Services in the shape the forms need. */
export function formServices(services: ServiceCard[]) {
  return services
    .filter((s) => s.slug && s.title)
    .map((s) => ({
      slug: s.slug!,
      title: s.title!,
      icon: (isIconName(s.icon) ? s.icon : 'wrench') as IconName,
    }))
}

export function contactLinks(settings: Settings, message: string) {
  return {
    tel: telHref(settings.phoneE164),
    whatsapp: whatsappHref(settings.whatsappE164, message),
    phoneDisplay: settings.phoneDisplay ?? '',
  }
}

export const turnstileSiteKey = publicEnv.NEXT_PUBLIC_TURNSTILE_SITE_KEY

/** Non-production builds show where photos will go; production hides empty galleries. */
export const showPlaceholders = process.env.SITE_ENV !== 'production'

export function formatDate(iso?: string | null): string | null {
  if (!iso) return null
  const d = new Date(`${iso.slice(0, 10)}T00:00:00Z`)
  return Number.isNaN(d.getTime())
    ? null
    : new Intl.DateTimeFormat('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
      }).format(d)
}
