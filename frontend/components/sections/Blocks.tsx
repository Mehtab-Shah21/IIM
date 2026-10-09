import clsx from 'clsx'
import Image from 'next/image'
import Link from 'next/link'
import {PortableText, type PortableTextComponents} from 'next-sanity'
import type {ReactNode} from 'react'

import {Icon, isIconName} from '@/components/icons/Icon'
import {ArrowLink, ButtonLink} from '@/components/ui/Button'
import {Card, PhotoPlaceholder} from '@/components/ui/Card'
import type {ServiceCard} from '@/lib/content'
import {routes} from '@/lib/routes'
import {sanityImage, type SanityImageValue} from '@/lib/sanity/image'

/* ---------- Portable Text ---------- */

const ptComponents: PortableTextComponents = {
  block: {
    h2: ({children}) => <h2>{children}</h2>,
    h3: ({children}) => <h3>{children}</h3>,
    blockquote: ({children}) => <blockquote className="border-l-4 border-gold pl-5 text-lead">{children}</blockquote>,
  },
  marks: {
    link: ({value, children}) => {
      const href = (value as {href?: string} | undefined)?.href ?? '#'
      return href.startsWith('/') ? (
        <Link href={href}>{children}</Link>
      ) : (
        <a href={href} {...(href.startsWith('http') ? {target: '_blank', rel: 'noopener noreferrer'} : {})}>
          {children}
        </a>
      )
    },
  },
  types: {
    imageWithAlt: ({value}) => {
      const img = sanityImage(value as SanityImageValue)
      return img ? (
        <figure className="overflow-hidden rounded-lg">
          <Image src={img.src} alt={img.alt} width={img.width} height={img.height} sizes="(min-width: 1024px) 760px, 100vw" />
        </figure>
      ) : null
    },
  },
}

export function RichText({value, className}: {value: unknown; className?: string}) {
  if (!Array.isArray(value) || !value.length) return null
  return (
    <div className={clsx('prose-iim', className)}>
      <PortableText value={value as Parameters<typeof PortableText>[0]['value']} components={ptComponents} />
    </div>
  )
}

/* ---------- Direct answer (AEO) ---------- */

export function DirectAnswer({text}: {text?: string | null}) {
  if (!text) return null
  return (
    <div className="grid max-w-prose gap-2 rounded-r-md border-l-4 border-gold bg-neutral-50 p-card">
      <span className="text-xs font-bold tracking-wide text-navy uppercase">In short</span>
      <p className="text-lead text-ink-900">{text}</p>
    </div>
  )
}

/* ---------- Checklist, steps, proof points, callout ---------- */

export function Checklist({items, columns = 2}: {items: string[]; columns?: 1 | 2}) {
  return (
    <ul className={clsx('m-0 grid list-none gap-3 p-0', columns === 2 && 'md:grid-cols-2')}>
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3">
          <Icon name="circle-check" size="sm" className="mt-1 text-success" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

export function Steps({items}: {items: Array<{title?: string | null; text?: string | null; icon?: string | null}>}) {
  return (
    <ol className="steps m-0 grid list-none gap-gap p-0 md:grid-cols-3">
      {items.map((s, i) => (
        <li key={`${s.title}-${i}`} className="grid content-start gap-3 rounded-md border border-neutral-200 bg-white p-card" data-reveal>
          <span className="inline-grid size-icon-tile place-items-center rounded-pill bg-accent font-heading text-h3 font-extrabold text-ink-900">
            {i + 1}
          </span>
          <h3 className="text-h4 font-bold text-ink-900">{s.title}</h3>
          {s.text ? <p className="text-neutral-600">{s.text}</p> : null}
        </li>
      ))}
    </ol>
  )
}

export function ProofPoints({
  items,
  tone = 'dark',
}: {
  items: Array<{icon?: string | null; title?: string | null; text?: string | null}>
  tone?: 'light' | 'dark'
}) {
  return (
    <div className="grid gap-gap md:grid-cols-2 lg:grid-cols-4">
      {items.map((p) => (
        <div
          key={p.title}
          className={clsx(
            'grid content-start gap-3 rounded-md border p-card',
            tone === 'dark' ? 'border-ink-700 bg-ink-800' : 'border-neutral-200 bg-white',
          )}
          data-reveal
        >
          <span className={clsx('inline-grid size-icon-tile place-items-center rounded-sm', tone === 'dark' ? 'bg-accent text-ink-900' : 'bg-ink-900 text-accent')}>
            <Icon name={isIconName(p.icon) ? p.icon : 'check'} />
          </span>
          <h3 className={clsx('text-h4 font-bold', tone === 'dark' ? 'text-cream' : 'text-ink-900')}>{p.title}</h3>
          {p.text ? <p className={tone === 'dark' ? 'text-cream-muted' : 'text-neutral-600'}>{p.text}</p> : null}
        </div>
      ))}
    </div>
  )
}

export function Callout({heading, text}: {heading?: string | null; text?: string | null}) {
  return (
    <div className="grid max-w-prose gap-2 rounded-md border border-gold bg-cream p-card" role="note">
      {heading ? (
        <p className="flex items-center gap-2 font-heading font-bold text-ink-900">
          <Icon name="triangle-alert" size="sm" />
          {heading}
        </p>
      ) : null}
      <p className="text-ink-900">{text}</p>
    </div>
  )
}

/* ---------- FAQ (native details: no JS, indexable, matches FAQPage schema) ---------- */

export function FaqList({items, center = false}: {items: Array<{question?: string | null; answer?: string | null}>; center?: boolean}) {
  const list = items.filter((f) => f.question && f.answer)
  if (!list.length) return null
  return (
    <div className={clsx('grid max-w-prose gap-3', center && 'mx-auto')}>
      {list.map((f, i) => (
        <details key={f.question} className="faq-item group rounded-md border border-neutral-200 bg-white" open={i === 0}>
          <summary className="flex min-h-control cursor-pointer list-none items-center justify-between gap-4 rounded-md px-card py-4 font-heading font-bold text-ink-900">
            <span>{f.question}</span>
            <Icon name="chevron-down" size="sm" className="transition-transform group-open:rotate-180" />
          </summary>
          <div className="px-card pb-card text-neutral-600">
            <p>{f.answer}</p>
          </div>
        </details>
      ))}
    </div>
  )
}

/* ---------- Service cards ---------- */

export function ServiceCardItem({service, headingLevel = 3}: {service: ServiceCard; headingLevel?: 2 | 3}) {
  const img = sanityImage(service.cardImage)
  return (
    <Card
      href={routes.service(service.slug ?? '')}
      title={service.title ?? ''}
      text={service.cardSummary}
      icon={isIconName(service.icon) ? service.icon : 'wrench'}
      cta="View service"
      headingLevel={headingLevel}
      media={
        img ? (
          <Image
            src={img.src}
            alt=""
            width={800}
            height={500}
            sizes="(min-width: 1024px) 384px, (min-width: 768px) 50vw, 100vw"
            className="size-full object-cover"
            placeholder={img.blurDataURL ? 'blur' : 'empty'}
            blurDataURL={img.blurDataURL}
          />
        ) : (
          <PhotoPlaceholder label={service.title ?? undefined} />
        )
      }
    />
  )
}

export function ServiceGrid({services}: {services: ServiceCard[]}) {
  return (
    <div className="grid items-stretch gap-gap md:grid-cols-2 lg:grid-cols-3">
      {services.map((s) => (
        <ServiceCardItem key={s._id} service={s} />
      ))}
    </div>
  )
}

/* ---------- Before / after ---------- */

type ProjectCard = {
  _id: string
  title: string | null
  slug: string | null
  location?: string | null
  before?: SanityImageValue
  after?: SanityImageValue
}

export function BeforeAfter({projects}: {projects: ProjectCard[]}) {
  if (!projects.length) return null
  return (
    <div className="grid gap-gap md:grid-cols-2 xl:grid-cols-3">
      {projects.map((p) => (
        <figure key={p._id} className="m-0 grid gap-3" data-reveal>
          <div className="grid grid-cols-2 gap-1 overflow-hidden rounded-lg">
            {(['before', 'after'] as const).map((k) => {
              const img = sanityImage(p[k])
              return (
                <div key={k} className="relative aspect-square bg-neutral-100">
                  {img ? (
                    <Image src={img.src} alt={img.alt} width={600} height={600} sizes="(min-width: 1280px) 190px, (min-width: 768px) 25vw, 50vw" className="size-full object-cover" />
                  ) : (
                    <PhotoPlaceholder label={`${k} photo`} />
                  )}
                  <span className="absolute top-2 left-2 rounded-sm bg-ink-900 px-2 py-1 text-xs font-bold text-cream">
                    {k === 'before' ? 'Before' : 'After'}
                  </span>
                </div>
              )
            })}
          </div>
          <figcaption className="grid gap-1">
            <Link href={routes.project(p.slug ?? '')} className="font-semibold text-ink-900">
              {p.title}
            </Link>
            {p.location ? <span className="text-small text-neutral-600">{p.location}</span> : null}
          </figcaption>
        </figure>
      ))}
    </div>
  )
}

/* ---------- CTA band ---------- */

export function CtaBand({
  heading,
  text,
  quoteHref,
  whatsappHref,
  telHref,
  phoneDisplay,
}: {
  heading: string
  text?: string | null
  quoteHref: string
  whatsappHref: string | null
  telHref: string | null
  phoneDisplay?: string | null
}) {
  return (
    <section className="section bg-white" aria-labelledby="cta-band-title">
      <div className="container-content">
        <div className="grid justify-items-center gap-5 rounded-lg bg-ink-900 px-card py-7 text-center lg:px-7 lg:py-8" data-reveal>
          <h2 id="cta-band-title" className="text-h2 font-bold text-cream">
            {heading}
          </h2>
          {text ? <p className="max-w-prose text-lead text-cream-muted">{text}</p> : null}
          <div className="flex flex-wrap justify-center gap-3">
            <ButtonLink href={quoteHref} variant="primary" data-track="cta_click" data-track-location="cta_band">
              Get a Quote
            </ButtonLink>
            {whatsappHref ? (
              <ButtonLink href={whatsappHref} external variant="whatsapp" icon="whatsapp" data-track="whatsapp_click" data-track-location="cta_band">
                WhatsApp Us
              </ButtonLink>
            ) : null}
            {telHref ? (
              <ButtonLink href={telHref} variant="secondary" tone="dark" icon="phone" data-track="phone_click" data-track-location="cta_band">
                {phoneDisplay}
              </ButtonLink>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------- Image and text ---------- */

export function ImageText({heading, image, imagePosition, body}: {heading?: string | null; image?: SanityImageValue; imagePosition?: string | null; body?: unknown}) {
  const img = sanityImage(image)
  return (
    <div className="grid items-center gap-5 md:grid-cols-2">
      <div className={clsx('aspect-card overflow-hidden rounded-lg bg-neutral-100', imagePosition === 'right' && 'md:order-2')}>
        {img ? (
          <Image src={img.src} alt={img.alt} width={800} height={500} sizes="(min-width: 1024px) 380px, (min-width: 768px) 50vw, 100vw" className="size-full object-cover" />
        ) : (
          <PhotoPlaceholder label={heading ?? undefined} />
        )}
      </div>
      <RichText value={body} />
    </div>
  )
}

/** Wrapper used for content blocks inside a page body (consistent heading spacing). */
export function ContentBlock({heading, id, children}: {heading?: string | null; id: string; children: ReactNode}) {
  return (
    <section className="grid gap-4" aria-labelledby={heading ? id : undefined} data-reveal>
      {heading ? (
        <h2 id={id} className="mb-1 text-h2 font-bold text-ink-900">
          {heading}
        </h2>
      ) : null}
      {children}
    </section>
  )
}

export {ArrowLink}
