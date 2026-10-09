import Link from 'next/link'

import {Icon} from '@/components/icons/Icon'
import {buttonClasses} from '@/components/ui/Button'
import {routes} from '@/lib/routes'

/**
 * Mobile action bar: 64px, fixed to the bottom, three equal buttons, respects the iOS safe area.
 * The body has matching bottom padding (globals.css). Desktop shows the floating WhatsApp button.
 */
export function ActionBar({tel, whatsapp}: {tel: string | null; whatsapp: string | null}) {
  return (
    <nav
      aria-label="Quick actions"
      className="action-bar fixed inset-x-0 bottom-0 z-50 grid grid-cols-3 gap-2 border-t border-neutral-200 bg-white p-2 shadow-lg lg:hidden"
    >
      {tel ? (
        <a
          href={tel}
          className={buttonClasses({variant: 'secondary', size: 'bar'})}
          data-track="phone_click"
          data-track-location="action_bar"
        >
          <Icon name="phone" size="sm" />
          Call
        </a>
      ) : (
        <span />
      )}
      {whatsapp ? (
        <a
          href={whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonClasses({variant: 'whatsapp', size: 'bar'})}
          data-track="whatsapp_click"
          data-track-location="action_bar"
        >
          <Icon name="whatsapp" size="sm" />
          WhatsApp
        </a>
      ) : (
        <span />
      )}
      <Link
        href={routes.quote}
        className={buttonClasses({variant: 'primary', size: 'bar'})}
        data-track="cta_click"
        data-track-location="action_bar"
      >
        Get a Quote
      </Link>
    </nav>
  )
}

export function WhatsAppFloat({href}: {href: string | null}) {
  if (!href) return null
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="focus-on-accent fixed right-6 bottom-6 z-30 hidden min-h-float items-center gap-2 rounded-pill bg-whatsapp px-5 py-3 font-semibold text-ink-900 no-underline shadow-lg transition hover:-translate-y-1 hover:bg-whatsapp-600 lg:inline-flex"
      data-track="whatsapp_click"
      data-track-location="float"
    >
      <Icon name="whatsapp" />
      WhatsApp Us
    </a>
  )
}
