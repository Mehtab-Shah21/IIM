import type {ReactNode} from 'react'

import {Breadcrumbs, type Crumb} from '@/components/layout/Breadcrumbs'
import {ButtonLink} from '@/components/ui/Button'
import {Img} from '@/components/ui/Img'
import {Eyebrow} from '@/components/ui/Layout'
import {WordReveal} from '@/components/ui/WordReveal'
import {sanityImage, type SanityImageValue} from '@/lib/sanity/image'

/**
 * Inner page hero: breadcrumbs, eyebrow, the single H1, lead, optional actions and meta line.
 * With an image: two columns from `lg`, the photo under the text on smaller screens.
 */
export function PageHero({
  title,
  eyebrow,
  lead,
  crumbs,
  actions,
  meta,
  image,
}: {
  title: string
  eyebrow?: string | null
  lead?: string | null
  crumbs: Crumb[]
  actions?: {quoteHref?: string; quoteLabel?: string; whatsappHref?: string | null}
  meta?: ReactNode
  image?: SanityImageValue
}) {
  const img = sanityImage(image)
  return (
    <section className="bg-ink-900 pt-7 pb-8 text-cream">
      <div className="container-content grid items-center gap-7 lg:grid-cols-12">
        <div className={img ? 'grid gap-5 lg:col-span-7' : 'grid max-w-prose gap-5 lg:col-span-12'}>
          <Breadcrumbs items={crumbs} />
          {eyebrow ? <Eyebrow tone="dark">{eyebrow}</Eyebrow> : null}
          <h1 className="text-h1 font-extrabold text-cream">
            <WordReveal text={title} mode="load" />
          </h1>
          {lead ? <p className="text-lead text-cream-muted">{lead}</p> : null}
          {actions ? (
            <div className="flex flex-wrap gap-3" data-track-zone="page-hero">
              {actions.quoteHref ? (
                <ButtonLink
                  href={actions.quoteHref}
                  variant="primary"
                  data-track="cta_click"
                  data-track-location="page_hero"
                >
                  {actions.quoteLabel ?? 'Get a Quote'}
                </ButtonLink>
              ) : null}
              {actions.whatsappHref ? (
                <ButtonLink
                  href={actions.whatsappHref}
                  external
                  variant="whatsapp"
                  icon="whatsapp"
                  data-track="whatsapp_click"
                  data-track-location="page_hero"
                >
                  WhatsApp Us
                </ButtonLink>
              ) : null}
            </div>
          ) : null}
          {meta ? (
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-small text-cream-muted">{meta}</div>
          ) : null}
        </div>
        {img ? (
          <div className="aspect-hero overflow-hidden rounded-lg bg-ink-800 shadow-lg lg:col-span-5">
            <Img
              src={img.src}
              alt={img.alt}
              width={img.width}
              height={img.height}
              priority
              sizes="(min-width: 1280px) 480px, (min-width: 1024px) 40vw, 100vw"
              className="size-full object-cover"
            />
          </div>
        ) : null}
      </div>
    </section>
  )
}
