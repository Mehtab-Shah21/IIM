import type {Settings, ServiceCard} from '@/lib/content'
import {telHref, whatsappHref} from '@/lib/contact'
import {quoteUrl, routes} from '@/lib/routes'
import {isIconName} from '@/components/icons/Icon'

import {Logo} from './Logo'
import {SiteNav, type NavItem} from './SiteNav'

export const navItems: NavItem[] = [
  {label: 'Home', href: routes.home, match: '/'},
  {label: 'Services', href: routes.services, match: '/services/', mega: true},
  {label: 'Annual Contract', href: routes.amc, match: '/annual-maintenance-contract/'},
  {label: 'About', href: routes.about, match: '/about/'},
  {label: 'Projects', href: routes.projects, match: '/projects/'},
  {label: 'Contact', href: routes.contact, match: '/contact/'},
]

/** Sticky header with a fixed height (never shifts layout). */
export function Header({settings, services, whatsappMessage}: {settings: Settings; services: ServiceCard[]; whatsappMessage: string}) {
  return (
    <header className="sticky top-0 z-40 h-header border-b border-ink-700 bg-ink-900 text-cream">
      <div className="container-wide flex h-full items-center justify-between gap-5">
        <Logo name={settings.businessName ?? 'IIM Technical Services'} />
        <SiteNav
          items={navItems}
          services={services
            .filter((s) => s.slug)
            .map((s) => ({
              title: s.title ?? '',
              href: routes.service(s.slug!),
              icon: isIconName(s.icon) ? s.icon : 'wrench',
              summary: s.menuSummary,
            }))}
          quoteHref={quoteUrl()}
          telHref={telHref(settings.phoneE164)}
          phoneDisplay={settings.phoneDisplay ?? ''}
          whatsappHref={whatsappHref(settings.whatsappE164, whatsappMessage)}
        />
      </div>
    </header>
  )
}
