import type {Metadata} from 'next'

import {CtaBand} from '@/components/sections/Blocks'
import {ContactDock} from '@/components/sections/ContactDock'
import {RatingSummary, Testimonials} from '@/components/sections/HomeSections'
import {PageHero} from '@/components/sections/PageHero'
import {JsonLd} from '@/components/seo/JsonLd'
import {ButtonLink} from '@/components/ui/Button'
import {Section} from '@/components/ui/Layout'
import {getPage, getSettings, getTestimonials} from '@/lib/content'
import {defaultWhatsappMessage} from '@/lib/contact'
import {contactLinks} from '@/lib/page-data'
import {quoteUrl, routes} from '@/lib/routes'
import {buildMetadata} from '@/lib/seo/metadata'
import {homeCrumb, pageGraph} from '@/lib/seo/page-graph'

export async function generateMetadata(): Promise<Metadata> {
  const [page, settings, reviews] = await Promise.all([
    getPage('reviews'),
    getSettings(),
    getTestimonials(),
  ])
  return buildMetadata({
    path: routes.reviews,
    seo: page?.seo,
    fallbackTitle: 'Customer Reviews | IIM Technical Services Dubai',
    fallbackDescription:
      'Read what customers say about our service, response time and workmanship.',
    // No approved reviews yet: thin page, keep it out of the index.
    noindex: reviews.length === 0 && !settings.ratingShow,
    defaultOgImage: settings.defaultOgImage,
  })
}

export default async function ReviewsPage() {
  const [page, settings, reviews] = await Promise.all([
    getPage('reviews'),
    getSettings(),
    getTestimonials(),
  ])
  const message = settings.defaultWhatsappMessage || defaultWhatsappMessage
  const links = contactLinks(settings, message)
  const crumbs = [homeCrumb, {name: 'Reviews'}]

  return (
    <>
      <JsonLd
        data={await pageGraph({
          path: routes.reviews,
          name: page?.heroHeadline ?? 'Customer reviews',
          crumbs,
          modified: page?._updatedAt,
          ratingVisible: true,
        })}
      />
      <PageHero
        title={page?.heroHeadline ?? 'Customer reviews'}
        eyebrow="Reviews"
        lead={page?.heroSubhead}
        crumbs={crumbs}
      />
      <Section labelledBy="reviews-title">
        <div className="mb-7 grid gap-4">
          <h2 id="reviews-title" className="text-h2 font-bold">
            What customers say
          </h2>
          <RatingSummary settings={settings} />
        </div>
        {reviews.length ? (
          <Testimonials items={reviews} />
        ) : (
          <p className="max-w-prose text-lead">Reviews from our customers will appear here soon.</p>
        )}
        <div className="mt-7 flex flex-wrap gap-3">
          {settings.reviewUrl ? (
            <ButtonLink href={settings.reviewUrl} external variant="primary" icon="star">
              Read all reviews on Google
            </ButtonLink>
          ) : null}
          {settings.gbpUrl ? (
            <ButtonLink href={settings.gbpUrl} external variant="secondary">
              Leave us a review
            </ButtonLink>
          ) : null}
        </div>
      </Section>
      <CtaBand
        heading="See for yourself"
        quoteHref={quoteUrl()}
        whatsappHref={links.whatsapp}
        telHref={links.tel}
        phoneDisplay={links.phoneDisplay}
      />
      <ContactDock message={message} />
    </>
  )
}
