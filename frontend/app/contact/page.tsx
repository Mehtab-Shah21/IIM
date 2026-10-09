import type {Metadata} from 'next'

import {QuoteForm} from '@/components/forms/QuoteForm'
import {Icon, type IconName} from '@/components/icons/Icon'
import {addressLine} from '@/components/layout/Footer'
import {ContactDock} from '@/components/sections/ContactDock'
import {ContactFlip} from '@/components/sections/ContactFlip'
import {PageHero} from '@/components/sections/PageHero'
import {JsonLd} from '@/components/seo/JsonLd'
import {Section} from '@/components/ui/Layout'
import {getPage, getServices, getSettings} from '@/lib/content'
import {defaultWhatsappMessage} from '@/lib/contact'
import {contactLinks, formServices, turnstileSiteKey} from '@/lib/page-data'
import {routes} from '@/lib/routes'
import {buildMetadata} from '@/lib/seo/metadata'
import {homeCrumb, pageGraph} from '@/lib/seo/page-graph'

export async function generateMetadata(): Promise<Metadata> {
  const [page, settings] = await Promise.all([getPage('contact'), getSettings()])
  return buildMetadata({
    path: routes.contact,
    seo: page?.seo,
    fallbackTitle: 'Contact IIM Technical Services | Call or WhatsApp',
    fallbackDescription:
      'Call, WhatsApp or email IIM for repairs, maintenance and renovation in Dubai.',
    defaultOgImage: settings.defaultOgImage,
  })
}

export default async function ContactPage() {
  const [page, settings, services] = await Promise.all([
    getPage('contact'),
    getSettings(),
    getServices(),
  ])
  const message = settings.defaultWhatsappMessage || defaultWhatsappMessage
  const links = contactLinks(settings, message)
  const crumbs = [homeCrumb, {name: 'Contact'}]
  const address = addressLine(settings)

  const rows: Array<{
    icon: IconName
    label: string
    value: string
    href?: string
    external?: boolean
    track?: string
  }> = [
    ...(links.tel
      ? [
          {
            icon: 'phone' as IconName,
            label: 'Phone',
            value: links.phoneDisplay,
            href: links.tel,
            track: 'phone_click',
          },
        ]
      : []),
    ...(links.whatsapp
      ? [
          {
            icon: 'whatsapp' as IconName,
            label: 'WhatsApp',
            value: 'Start a chat',
            href: links.whatsapp,
            external: true,
            track: 'whatsapp_click',
          },
        ]
      : []),
    ...(settings.email
      ? [
          {
            icon: 'mail' as IconName,
            label: 'Email',
            value: settings.email,
            href: `mailto:${settings.email}`,
          },
        ]
      : []),
    {icon: 'map-pin', label: 'Address', value: address},
    ...(settings.hoursText
      ? [{icon: 'clock' as IconName, label: 'Hours', value: settings.hoursText}]
      : []),
  ]

  return (
    <>
      <JsonLd
        data={await pageGraph({
          path: routes.contact,
          name: page?.heroHeadline ?? 'Contact',
          crumbs,
          modified: page?._updatedAt,
          pageType: 'ContactPage',
        })}
      />
      <PageHero
        title={page?.heroHeadline ?? 'Contact IIM Technical Services'}
        eyebrow="Contact"
        lead={page?.heroSubhead}
        crumbs={crumbs}
      />
      <Section>
        <div className="grid items-start gap-7 lg:grid-cols-12 lg:gap-gap">
          <div className="grid content-start gap-5 lg:col-span-5" data-track-zone="contact">
            <h2 className="text-h2 font-bold">Get in touch</h2>
            <ContactFlip
              tiles={[
                ...(links.tel
                  ? [
                      {
                        letter: 'C',
                        label: `Call ${links.phoneDisplay}`,
                        icon: 'phone' as IconName,
                        href: links.tel,
                        track: 'phone_click',
                      },
                    ]
                  : []),
                ...(links.whatsapp
                  ? [
                      {
                        letter: 'W',
                        label: 'WhatsApp',
                        icon: 'whatsapp' as IconName,
                        href: links.whatsapp,
                        external: true,
                        track: 'whatsapp_click',
                      },
                    ]
                  : []),
                ...(settings.email
                  ? [
                      {
                        letter: 'E',
                        label: `Email ${settings.email}`,
                        icon: 'mail' as IconName,
                        href: `mailto:${settings.email}`,
                      },
                    ]
                  : []),
                {
                  letter: 'Q',
                  label: 'Quote form',
                  icon: 'file-text' as IconName,
                  href: '#quote-form',
                },
              ]}
            />
            <ul className="m-0 grid list-none gap-4 p-0">
              {rows.map((r) => (
                <li key={r.label} className="flex items-center gap-3">
                  <span className="inline-grid size-icon-tile shrink-0 place-items-center rounded-sm bg-ink-900 text-accent">
                    <Icon name={r.icon} />
                  </span>
                  <span className="grid min-w-0">
                    <span className="text-small text-neutral-600">{r.label}</span>
                    {r.href ? (
                      <a
                        href={r.href}
                        className="font-semibold break-words text-navy"
                        {...(r.external ? {target: '_blank', rel: 'noopener noreferrer'} : {})}
                        {...(r.track
                          ? {'data-track': r.track, 'data-track-location': 'contact'}
                          : {})}
                      >
                        {r.value}
                      </a>
                    ) : (
                      <span className="font-semibold">{r.value}</span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
            {settings.gbpUrl ? (
              <a
                href={settings.gbpUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-navy"
              >
                Find us on Google Maps
              </a>
            ) : null}
          </div>
          <div className="rounded-md border border-neutral-200 bg-white p-card shadow-md md:p-6 lg:col-span-7">
            <h2 id="quote-form" className="mb-2 text-h3 font-bold">
              Request a quote
            </h2>
            <p className="mb-5 text-neutral-600">
              Three short steps. We reply to confirm the visit.
            </p>
            <QuoteForm services={formServices(services)} siteKey={turnstileSiteKey} />
          </div>
        </div>
      </Section>
      <ContactDock message={message} />
    </>
  )
}
