import {Img} from '@/components/ui/Img'
import Link from 'next/link'

import {Icon, isIconName, type IconName} from '@/components/icons/Icon'
import {ButtonLink} from '@/components/ui/Button'
import type {ServiceCard, Settings, Testimonial} from '@/lib/content'
import {routes} from '@/lib/routes'
import {sanityImage, type SanityImageValue} from '@/lib/sanity/image'

/** Homepage hero: the H1 (or the optional hero photo) is the LCP element. No video. */
export function HomeHero({
  headline,
  accent,
  subhead,
  image,
  quoteHref,
  whatsappHref,
  settings,
}: {
  headline: string
  accent?: string | null
  subhead?: string | null
  image?: SanityImageValue
  quoteHref: string
  whatsappHref: string | null
  settings: Settings
}) {
  const img = sanityImage(image)
  return (
    <section
      className="hero-pattern relative overflow-hidden bg-ink-900 py-8 text-cream lg:py-9"
      data-track-zone="hero"
    >
      <div className="container-content relative">
        <div className="grid items-center gap-7 lg:grid-cols-12 lg:gap-gap">
          <div
            className={
              img
                ? 'grid content-start gap-5 lg:col-span-7'
                : 'grid content-start gap-5 lg:col-span-9'
            }
          >
            <h1 className="text-h1 font-extrabold text-cream">
              {headline} {accent ? <span className="text-accent">{accent}</span> : null}
            </h1>
            {subhead ? <p className="max-w-prose text-lead text-cream-muted">{subhead}</p> : null}
            <div className="flex flex-wrap gap-3">
              <ButtonLink
                href={quoteHref}
                variant="primary"
                className="w-full sm:w-auto"
                data-track="cta_click"
                data-track-location="hero"
              >
                Get a Quote
              </ButtonLink>
              {whatsappHref ? (
                <ButtonLink
                  href={whatsappHref}
                  external
                  variant="whatsapp"
                  icon="whatsapp"
                  className="w-full sm:w-auto"
                  data-track="whatsapp_click"
                  data-track-location="hero"
                >
                  WhatsApp Us
                </ButtonLink>
              ) : null}
            </div>
            <TrustStrip settings={settings} />
          </div>
          {img ? (
            <div className="aspect-hero overflow-hidden rounded-lg bg-ink-800 shadow-lg lg:col-span-4 lg:col-start-9">
              <Img
                src={img.src}
                alt={img.alt}
                width={1200}
                height={900}
                priority
                sizes="(min-width: 1024px) 380px, 100vw"
                className="size-full object-cover"
              />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}

/** Only claims switched on in siteSettings (i.e. confirmed by the owner) appear here. */
export function TrustStrip({settings}: {settings: Settings}) {
  const items: Array<{icon: IconName; text: string; href?: string}> = []
  if (settings.is247) items.push({icon: 'clock', text: '24/7 emergency help'})
  if (settings.dewaShow && settings.dewaShort)
    items.push({icon: 'shield-check', text: settings.dewaShort})
  items.push({icon: 'wallet', text: 'Pay after the service'})
  items.push({icon: 'message-circle', text: 'Book in 3 steps'})
  if (settings.ratingShow && settings.ratingValue) {
    items.push({
      icon: 'star',
      text: `${settings.ratingValue} on Google`,
      href: settings.reviewUrl ?? undefined,
    })
  }
  return (
    <ul
      className="m-0 grid list-none grid-cols-2 gap-3 p-0 md:flex md:flex-wrap"
      aria-label="Why customers choose us"
    >
      {items.map((i) => (
        <li
          key={i.text}
          className="flex min-h-tap items-center gap-2 rounded-sm border border-ink-700 px-3 py-2 text-small font-semibold leading-tight"
        >
          <Icon name={i.icon} size="sm" className="text-accent" />
          {i.href ? (
            <a href={i.href} target="_blank" rel="noopener noreferrer" className="text-cream">
              {i.text}
            </a>
          ) : (
            <span>{i.text}</span>
          )}
        </li>
      ))}
    </ul>
  )
}

export function EmergencyBand({
  service,
  telHref,
  whatsappHref,
}: {
  service: ServiceCard
  telHref: string | null
  whatsappHref: string | null
}) {
  return (
    <div
      className="emergency-band mt-gap grid items-center gap-4 rounded-md bg-ink-900 p-card text-cream-muted md:gap-5"
      data-reveal
      data-track-zone="emergency-band"
    >
      <span className="inline-grid size-icon-tile place-items-center rounded-sm bg-accent text-ink-900">
        <Icon name={isIconName(service.icon) ? service.icon : 'siren'} />
      </span>
      <div className="grid gap-1">
        <h3 className="text-h3 font-bold text-cream">
          <Link href={routes.service(service.slug ?? '')} className="no-underline hover:underline">
            {service.title}
          </Link>
        </h3>
        {service.cardSummary ? <p>{service.cardSummary}</p> : null}
      </div>
      <div className="flex flex-wrap gap-3">
        {telHref ? (
          <ButtonLink
            href={telHref}
            variant="primary"
            icon="phone"
            data-track="phone_click"
            data-track-location="emergency_band"
          >
            Call now
          </ButtonLink>
        ) : null}
        {whatsappHref ? (
          <ButtonLink
            href={whatsappHref}
            external
            variant="whatsapp"
            icon="whatsapp"
            data-track="whatsapp_click"
            data-track-location="emergency_band"
          >
            WhatsApp
          </ButtonLink>
        ) : null}
      </div>
    </div>
  )
}

export function Stats({stats}: {stats: NonNullable<Settings['stats']>}) {
  const list = stats.filter((s) => typeof s.value === 'number' && s.label)
  if (!list.length) return null
  return (
    <ul
      className="m-0 mt-8 grid list-none grid-cols-2 gap-gap p-0 md:grid-cols-4"
      aria-label="IIM in numbers"
    >
      {list.map((s) => (
        <li key={s.label} className="grid gap-1 border-l-4 border-accent p-card">
          <span
            className="font-heading text-stat font-extrabold tabular-nums text-cream"
            data-count-to={s.value!}
            data-count-suffix={s.suffix ?? ''}
          >
            {new Intl.NumberFormat('en').format(s.value!)}
            {s.suffix}
          </span>
          <span className="text-cream-muted">{s.label}</span>
        </li>
      ))}
    </ul>
  )
}

export function Testimonials({items}: {items: Testimonial[]}) {
  return (
    <div className="grid items-stretch gap-gap md:grid-cols-2 lg:grid-cols-3">
      {items.map((t) => (
        <figure
          key={t._id}
          className="m-0 flex h-full flex-col gap-4 rounded-md border border-neutral-200 bg-white p-card"
          data-reveal
        >
          <Icon name="quote" size="lg" className="text-gold" />
          {t.rating ? (
            <span
              className="flex gap-1 text-gold"
              role="img"
              aria-label={`Rated ${t.rating} out of 5`}
            >
              {Array.from({length: Math.min(5, t.rating)}, (_, i) => (
                <Icon key={i} name="star" size="sm" className="fill-current" />
              ))}
            </span>
          ) : null}
          <blockquote className="m-0 text-lead text-ink-900">
            <p>{t.quote}</p>
          </blockquote>
          <figcaption className="mt-auto grid gap-1">
            <strong className="text-ink-900">{t.name}</strong>
            {t.context ? <span className="text-small text-neutral-600">{t.context}</span> : null}
            {t.sourceUrl ? (
              <a
                href={t.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-small text-navy"
              >
                View the original review
              </a>
            ) : null}
          </figcaption>
        </figure>
      ))}
    </div>
  )
}

export function RatingSummary({settings}: {settings: Settings}) {
  if (!settings.ratingShow || !settings.ratingValue || !settings.ratingCount) return null
  return (
    <p className="flex flex-wrap items-center gap-3 font-semibold">
      <span className="flex gap-1 text-gold" aria-hidden="true">
        {Array.from({length: Math.round(settings.ratingValue)}, (_, i) => (
          <Icon key={i} name="star" size="sm" className="fill-current" />
        ))}
      </span>
      {settings.ratingValue} out of 5 from{' '}
      {new Intl.NumberFormat('en').format(settings.ratingCount)} Google reviews
    </p>
  )
}
