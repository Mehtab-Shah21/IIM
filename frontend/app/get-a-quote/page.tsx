import type {Metadata} from 'next'

import {AmcForm} from '@/components/forms/AmcForm'
import {QuoteForm} from '@/components/forms/QuoteForm'
import {Icon} from '@/components/icons/Icon'
import {ContactDock} from '@/components/sections/ContactDock'
import {ContentLayout} from '@/components/sections/Inner'
import {PageHero} from '@/components/sections/PageHero'
import {JsonLd} from '@/components/seo/JsonLd'
import {ButtonLink} from '@/components/ui/Button'
import {getPage, getServices, getSettings} from '@/lib/content'
import {defaultWhatsappMessage} from '@/lib/contact'
import {REFERENCE_PATTERN} from '@/lib/forms/reference-pattern'
import {contactLinks, formServices, turnstileSiteKey} from '@/lib/page-data'
import {routes} from '@/lib/routes'
import {buildMetadata} from '@/lib/seo/metadata'
import {homeCrumb, pageGraph} from '@/lib/seo/page-graph'

type Props = {searchParams: Promise<Record<string, string | string[] | undefined>>}

const errorMessages: Record<string, string> = {
  too_fast: 'That was very quick. Please check your details and send again.',
  turnstile: 'The spam check did not pass. Please try again, or message us on WhatsApp.',
  bad_form: 'Your session expired. Please try again.',
  origin: 'Your session expired. Please try again.',
  rate: 'Too many requests from your connection. Please message us on WhatsApp instead.',
  delivery:
    'We could not send your request right now. Please call or WhatsApp us and quote your reference.',
}

export async function generateMetadata(): Promise<Metadata> {
  const [page, settings] = await Promise.all([getPage('get-a-quote'), getSettings()])
  return buildMetadata({
    path: routes.quote,
    seo: page?.seo,
    fallbackTitle: 'Get a Quote | IIM Technical Services Dubai',
    fallbackDescription:
      'Tell us the issue and choose a time. We reply quickly and you pay after the service.',
    defaultOgImage: settings.defaultOgImage,
  })
}

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)

export default async function QuotePage({searchParams}: Props) {
  const params = await searchParams
  const [page, settings, services] = await Promise.all([
    getPage('get-a-quote'),
    getSettings(),
    getServices(),
  ])
  const message = settings.defaultWhatsappMessage || defaultWhatsappMessage
  const links = contactLinks(settings, message)
  const crumbs = [homeCrumb, {name: 'Get a Quote'}]

  // Errors from a no-JavaScript submission: field names only (no personal data in URLs).
  const type = one(params.type) === 'amc' ? 'amc' : 'quote'
  const fieldErrors = Object.fromEntries(
    (one(params.errors) ?? '')
      .split(',')
      .filter((f) => /^[a-zA-Z]{2,20}$/.test(f))
      .map((f) => [f, 'Please check this field.']),
  )
  const errorKey = one(params.error)
  const ref = one(params.ref)
  const safeRef = ref && REFERENCE_PATTERN.test(ref) ? ref : undefined
  const formMessage =
    errorKey && errorMessages[errorKey]
      ? errorMessages[errorKey]
      : Object.keys(fieldErrors).length
        ? 'Please check the highlighted fields.'
        : undefined
  const preselect = one(params.need)

  return (
    <>
      <JsonLd
        data={await pageGraph({
          path: routes.quote,
          name: page?.heroHeadline ?? 'Get a quote',
          crumbs,
          modified: page?._updatedAt,
        })}
      />
      <PageHero
        title={page?.heroHeadline ?? 'Get a quote'}
        eyebrow="Get a Quote"
        lead={page?.heroSubhead}
        crumbs={crumbs}
      />
      <ContentLayout
        asideLabel="Other ways to book"
        aside={
          <div className="grid gap-4 rounded-md border border-neutral-200 bg-white p-card shadow-md">
            <h2 className="text-h3 font-bold">Prefer WhatsApp?</h2>
            <p>
              Send a photo or short video of the issue with your location. It is the quickest way to
              book.
            </p>
            {links.whatsapp ? (
              <ButtonLink
                href={links.whatsapp}
                external
                variant="whatsapp"
                icon="whatsapp"
                block
                data-track="whatsapp_click"
                data-track-location="quote_aside"
              >
                WhatsApp Us
              </ButtonLink>
            ) : null}
            {links.tel ? (
              <ButtonLink
                href={links.tel}
                variant="secondary"
                icon="phone"
                block
                data-track="phone_click"
                data-track-location="quote_aside"
              >
                {links.phoneDisplay}
              </ButtonLink>
            ) : null}
            <ul className="m-0 grid list-none gap-3 p-0">
              {[
                'You pay after the service',
                ...(settings.freeQuotes ? ['Quotes are free'] : []),
                ...(settings.responseTime ? [settings.responseTime] : []),
              ].map((t) => (
                <li key={t} className="flex items-start gap-3">
                  <Icon name="circle-check" size="sm" className="mt-1 text-success" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        }
      >
        <div className="rounded-md border border-neutral-200 bg-white p-card shadow-md md:p-6">
          <h2 className="sr-only">
            {type === 'amc' ? 'Annual contract application' : 'Quote request form'}
          </h2>
          {safeRef ? <p className="mb-4 font-semibold">Your reference: {safeRef}</p> : null}
          {type === 'amc' ? (
            <AmcForm
              idPrefix="amc-quote"
              siteKey={turnstileSiteKey}
              initialErrors={fieldErrors}
              initialMessage={formMessage}
            />
          ) : (
            <QuoteForm
              services={formServices(services)}
              preselect={preselect}
              siteKey={turnstileSiteKey}
              initialErrors={fieldErrors}
              initialMessage={formMessage}
            />
          )}
        </div>
      </ContentLayout>
      <ContactDock message={message} />
    </>
  )
}
