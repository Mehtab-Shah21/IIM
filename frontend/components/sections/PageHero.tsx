import type {ReactNode} from 'react'

import {Breadcrumbs, type Crumb} from '@/components/layout/Breadcrumbs'
import {ButtonLink} from '@/components/ui/Button'
import {Eyebrow} from '@/components/ui/Layout'

/** Inner page hero: breadcrumbs, eyebrow, the single H1, lead, optional actions and meta line. */
export function PageHero({
  title,
  eyebrow,
  lead,
  crumbs,
  actions,
  meta,
}: {
  title: string
  eyebrow?: string | null
  lead?: string | null
  crumbs: Crumb[]
  actions?: {quoteHref?: string; quoteLabel?: string; whatsappHref?: string | null}
  meta?: ReactNode
}) {
  return (
    <section className="bg-ink-900 pt-7 pb-8 text-cream">
      <div className="container-content">
        <div className="grid max-w-prose gap-5">
          <Breadcrumbs items={crumbs} />
          {eyebrow ? <Eyebrow tone="dark">{eyebrow}</Eyebrow> : null}
          <h1 className="text-h1 font-extrabold text-cream">{title}</h1>
          {lead ? <p className="text-lead text-cream-muted">{lead}</p> : null}
          {actions ? (
            <div className="flex flex-wrap gap-3" data-track-zone="page-hero">
              {actions.quoteHref ? (
                <ButtonLink href={actions.quoteHref} variant="primary" data-track="cta_click" data-track-location="page_hero">
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
          {meta ? <div className="flex flex-wrap gap-x-4 gap-y-2 text-small text-cream-muted">{meta}</div> : null}
        </div>
      </div>
    </section>
  )
}
