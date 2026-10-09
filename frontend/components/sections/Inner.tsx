import Link from 'next/link'
import type {ReactNode} from 'react'

import {Icon, type IconName} from '@/components/icons/Icon'
import {ButtonLink} from '@/components/ui/Button'
import {Section, SectionHeader} from '@/components/ui/Layout'
import type {ServiceCard} from '@/lib/content'

import {ServiceGrid} from './Blocks'

/** Main column (8 of 12) with a sticky aside (4 of 12) from 1024px. */
export function ContentLayout({children, aside, asideLabel}: {children: ReactNode; aside?: ReactNode; asideLabel?: string}) {
  return (
    <section className="section bg-white">
      <div className="container-content">
        <div className="grid gap-7 lg:grid-cols-12 lg:gap-gap">
          <div className="grid min-w-0 content-start gap-8 lg:col-span-8">{children}</div>
          {aside ? (
            <aside className="lg:col-span-4" aria-label={asideLabel}>
              <div className="sticky-aside">{aside}</div>
            </aside>
          ) : null}
        </div>
      </div>
    </section>
  )
}

/** "Book in three steps" panel used beside service, area, guide and project content. */
export function AsideCta({
  heading = 'Book in three steps',
  quoteHref,
  whatsappHref,
  telHref,
  phoneDisplay,
}: {
  heading?: string
  quoteHref: string
  whatsappHref: string | null
  telHref: string | null
  phoneDisplay: string
}) {
  const steps: Array<[IconName, string]> = [
    ['message-circle', 'Message us on WhatsApp or send the quote form.'],
    ['camera', 'Share a photo or short video of the issue.'],
    ['calendar-check', 'Send your location and the date that suits you.'],
  ]
  return (
    <div className="grid gap-4 rounded-md bg-ink-900 p-card text-cream shadow-md" data-track-zone="aside">
      <h2 className="text-h3 font-bold text-cream">{heading}</h2>
      <ol className="m-0 grid list-none gap-3 p-0">
        {steps.map(([icon, text]) => (
          <li key={text} className="flex items-start gap-3 text-cream-muted">
            <Icon name={icon} size="sm" className="mt-1 text-accent" />
            <span>{text}</span>
          </li>
        ))}
      </ol>
      <p className="font-semibold text-cream">You pay after the service.</p>
      <ButtonLink href={quoteHref} variant="primary" block data-track="cta_click" data-track-location="aside">
        Get a Quote
      </ButtonLink>
      {whatsappHref ? (
        <ButtonLink href={whatsappHref} external variant="whatsapp" icon="whatsapp" block data-track="whatsapp_click" data-track-location="aside">
          WhatsApp Us
        </ButtonLink>
      ) : null}
      {telHref ? (
        <ButtonLink href={telHref} variant="secondary" tone="dark" icon="phone" block data-track="phone_click" data-track-location="aside">
          {phoneDisplay}
        </ButtonLink>
      ) : null}
    </div>
  )
}

/** "From" prices: shown only when both the site-wide and the per-service switch are on. */
export function PriceList({
  prices,
  visible,
  note,
}: {
  prices?: Array<{name?: string | null; priceFrom?: number | null; note?: string | null; _key?: string}> | null
  visible: boolean
  note?: string | null
}) {
  const list = (prices ?? []).filter((p) => p.name && typeof p.priceFrom === 'number')
  if (!visible || !list.length) return null
  return (
    <section className="grid gap-4" aria-labelledby="prices-title" data-reveal>
      <h2 id="prices-title" className="text-h2 font-bold">
        Starting prices
      </h2>
      <ul className="m-0 grid list-none overflow-hidden rounded-md border border-neutral-200 p-0">
        {list.map((p) => (
          <li key={p._key ?? p.name} className="flex justify-between gap-4 border-b border-neutral-200 px-card py-4 last:border-b-0">
            <span>
              {p.name}
              {p.note ? <small className="block text-neutral-600">{p.note}</small> : null}
            </span>
            <strong className="whitespace-nowrap">From AED {new Intl.NumberFormat('en').format(p.priceFrom!)}</strong>
          </li>
        ))}
      </ul>
      {note ? <p className="text-small text-neutral-600">{note}</p> : null}
    </section>
  )
}

export function ChipLinks({items, icon}: {items: Array<{href: string; label: string}>; icon?: IconName}) {
  if (!items.length) return null
  return (
    <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
      {items.map((i) => (
        <li key={i.href}>
          <Link
            href={i.href}
            className="inline-flex min-h-tap items-center gap-1 rounded-pill bg-neutral-100 px-3 text-small font-semibold text-ink-900 no-underline hover:bg-cream"
          >
            {icon ? <Icon name={icon} size="sm" /> : null}
            {i.label}
          </Link>
        </li>
      ))}
    </ul>
  )
}

export function RelatedServices({services, title = 'Related services', areas}: {services: ServiceCard[]; title?: string; areas?: Array<{href: string; label: string}>}) {
  if (!services.length && !areas?.length) return null
  return (
    <Section surface="neutral" labelledBy="related-title">
      <SectionHeader id="related-title" title={title} />
      <ServiceGrid services={services.slice(0, 3)} />
      {areas?.length ? (
        <div className="mt-8 grid gap-4">
          <h2 className="text-h3 font-bold">Areas we cover in Dubai</h2>
          <ChipLinks items={areas} icon="map-pin" />
        </div>
      ) : null}
    </Section>
  )
}
