import Link from 'next/link'

import {Icon} from '@/components/icons/Icon'
import type {ServiceCard, Settings} from '@/lib/content'
import {telHref, whatsappHref} from '@/lib/contact'
import {routes} from '@/lib/routes'

import {navItems} from './Header'
import {Logo} from './Logo'

type Area = {title: string | null; slug: string | null}

export function addressLine(settings: Settings): string {
  const a = settings.address
  const country = a?.country === 'AE' ? 'United Arab Emirates' : a?.country
  return [a?.street, a?.locality, country].filter(Boolean).join(', ')
}

export function Footer({
  settings,
  services,
  areas,
  publishedKeys,
  whatsappMessage,
}: {
  settings: Settings
  services: ServiceCard[]
  areas: Area[]
  publishedKeys: Set<string>
  whatsappMessage: string
}) {
  const name = settings.businessName ?? 'IIM Technical Services'
  const tel = telHref(settings.phoneE164)
  const wa = whatsappHref(settings.whatsappE164, whatsappMessage)
  const socials = (settings.socials ?? []).filter((s) => s.url)
  const legal = [
    {key: 'privacy-policy', label: 'Privacy Policy', href: routes.privacy},
    {key: 'terms', label: 'Terms', href: routes.terms},
    {key: 'accessibility', label: 'Accessibility', href: routes.accessibility},
  ].filter((l) => publishedKeys.has(l.key))

  return (
    <footer className="bg-ink-950 pt-8 pb-6 text-small text-cream-muted">
      <div className="container-content">
        <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-12 lg:gap-gap">
          <div className="grid content-start gap-4 lg:col-span-4">
            <Logo name={name} />
            {settings.footerDescription ? <p>{settings.footerDescription}</p> : null}
            {settings.licenceNumber ? (
              <p>
                Trade licence {settings.licenceNumber}
                {settings.licenceAuthority ? ` (${settings.licenceAuthority})` : ''}
              </p>
            ) : null}
            {socials.length ? (
              <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
                {socials.map((s) => (
                  <li key={s.url}>
                    <a
                      href={s.url!}
                      target="_blank"
                      rel="noopener noreferrer me"
                      className="inline-flex min-h-tap items-center rounded-pill border border-ink-700 px-3 text-cream no-underline hover:border-accent"
                    >
                      {s.network}
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <FooterList title="Services" className="lg:col-span-3">
            {services.map((s) => (
              <FooterLink key={s._id} href={routes.service(s.slug ?? '')}>
                {s.title}
              </FooterLink>
            ))}
            <FooterLink href={routes.amc}>Annual Maintenance Contract</FooterLink>
          </FooterList>

          <FooterList title="Company" className="lg:col-span-2" id="footer-nav">
            {navItems
              .filter((i) => !i.mega && i.href !== '/')
              .map((i) => (
                <FooterLink key={i.href} href={i.href}>
                  {i.label}
                </FooterLink>
              ))}
            <FooterLink href={routes.reviews}>Reviews</FooterLink>
            <FooterLink href={routes.faq}>FAQ</FooterLink>
            <FooterLink href={routes.guides}>Guides</FooterLink>
            {areas.slice(0, 6).map((a) => (
              <FooterLink key={a.slug} href={routes.area(a.slug ?? '')}>
                {a.title}
              </FooterLink>
            ))}
            <FooterLink href={routes.areas}>Areas we serve</FooterLink>
          </FooterList>

          <FooterList title="Contact" className="lg:col-span-3">
            {tel ? (
              <li>
                <a
                  href={tel}
                  className="footer-link"
                  data-track="phone_click"
                  data-track-location="footer"
                >
                  <Icon name="phone" size="sm" className="text-accent" />
                  {settings.phoneDisplay}
                </a>
              </li>
            ) : null}
            {wa ? (
              <li>
                <a
                  href={wa}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-link"
                  data-track="whatsapp_click"
                  data-track-location="footer"
                >
                  <Icon name="whatsapp" size="sm" className="text-accent" />
                  WhatsApp
                </a>
              </li>
            ) : null}
            {settings.email ? (
              <li>
                <a href={`mailto:${settings.email}`} className="footer-link">
                  <Icon name="mail" size="sm" className="text-accent" />
                  {settings.email}
                </a>
              </li>
            ) : null}
            <li className="flex min-h-tap items-center gap-2">
              <Icon name="map-pin" size="sm" className="text-accent" />
              {addressLine(settings)}
            </li>
            {settings.hoursText ? (
              <li className="flex min-h-tap items-center gap-2">
                <Icon name="clock" size="sm" className="text-accent" />
                {settings.hoursText}
              </li>
            ) : null}
          </FooterList>
        </div>

        <div className="mt-7 flex flex-wrap justify-between gap-4 border-t border-ink-700 pt-5">
          <p>
            © {new Date().getFullYear()} {settings.legalName || name}. All rights reserved.
          </p>
          {legal.length ? (
            <ul className="m-0 flex list-none flex-wrap gap-x-4 gap-y-1 p-0">
              {legal.map((l) => (
                <FooterLink key={l.href} href={l.href}>
                  {l.label}
                </FooterLink>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </footer>
  )
}

function FooterList({
  title,
  children,
  className,
  id,
}: {
  title: string
  children: React.ReactNode
  className?: string
  id?: string
}) {
  return (
    <div className={className} id={id}>
      <h2 className="mb-4 text-body font-bold text-cream">{title}</h2>
      <ul className="m-0 grid list-none gap-1 p-0">{children}</ul>
    </div>
  )
}

function FooterLink({href, children}: {href: string; children: React.ReactNode}) {
  return (
    <li>
      <Link href={href} className="footer-link">
        {children}
      </Link>
    </li>
  )
}
