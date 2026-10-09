import type {Metadata} from 'next'

import {ServiceGrid} from '@/components/sections/Blocks'
import {ButtonLink} from '@/components/ui/Button'
import {Section, SectionHeader} from '@/components/ui/Layout'
import {getServices} from '@/lib/content'
import {routes} from '@/lib/routes'

export const metadata: Metadata = {
  title: {absolute: 'Page not found | IIM Technical Services'},
  robots: {index: false, follow: true},
}

/** Helpful routes instead of a dead end. */
export default async function NotFound() {
  const services = await getServices()
  return (
    <>
      <section className="bg-ink-900 pt-7 pb-8 text-cream">
        <div className="container-content grid max-w-prose gap-5">
          <h1 className="text-h1 font-extrabold text-cream">We could not find that page</h1>
          <p className="text-lead text-cream-muted">The link may be old or mistyped. These pages should help you find what you need.</p>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href={routes.home} variant="primary">
              Go to the homepage
            </ButtonLink>
            <ButtonLink href={routes.contact} variant="secondary" tone="dark">
              Contact us
            </ButtonLink>
          </div>
        </div>
      </section>
      <Section labelledBy="popular">
        <SectionHeader id="popular" title="Popular services" />
        <ServiceGrid services={services.filter((s) => !s.isEmergency).slice(0, 6)} />
      </Section>
    </>
  )
}
