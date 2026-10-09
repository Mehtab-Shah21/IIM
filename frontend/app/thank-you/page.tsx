import type {Metadata} from 'next'

import {Icon} from '@/components/icons/Icon'
import {PageHero} from '@/components/sections/PageHero'
import {ArrowLink, ButtonLink} from '@/components/ui/Button'
import {Section} from '@/components/ui/Layout'
import {getPage, getSettings} from '@/lib/content'
import {whatsappHref} from '@/lib/contact'
import {REFERENCE_PATTERN} from '@/lib/forms/reference-pattern'
import {routes} from '@/lib/routes'
import {buildMetadata} from '@/lib/seo/metadata'
import {homeCrumb} from '@/lib/seo/page-graph'

type Props = {searchParams: Promise<Record<string, string | string[] | undefined>>}

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    path: routes.thankYou,
    fallbackTitle: 'Thank you | IIM Technical Services',
    fallbackDescription: 'Your request has been received.',
    noindex: true,
  })
}

export default async function ThankYouPage({searchParams}: Props) {
  const params = await searchParams
  const [page, settings] = await Promise.all([getPage('thank-you'), getSettings()])
  const rawRef = Array.isArray(params.ref) ? params.ref[0] : params.ref
  const ref = rawRef && REFERENCE_PATTERN.test(rawRef) ? rawRef : null
  const isAmc = params.type === 'amc'
  const message = ref
    ? `Hi IIM, I just sent a request on your website. My reference is ${ref}.`
    : 'Hi IIM, I just sent a request on your website.'
  const wa = whatsappHref(settings.whatsappE164, message)

  return (
    <>
      <PageHero
        title={page?.heroHeadline ?? 'Thank you, we have your request'}
        crumbs={[homeCrumb, {name: 'Thank you'}]}
        lead={ref ? `Your reference number is ${ref}.` : null}
      />
      <Section>
        <div className="grid max-w-prose gap-6">
          <div
            role="status"
            className="flex items-start gap-3 rounded-sm bg-success-bg p-4 font-medium text-success"
          >
            <Icon name="circle-check" size="sm" className="mt-1" />
            <span>
              Your request was sent. If you gave us your email address, a confirmation is on its
              way.
            </span>
          </div>
          <div className="grid gap-3">
            <h2 className="text-h2 font-bold">What happens next</h2>
            <ol className="m-0 grid gap-2 pl-5">
              <li>
                We review your {isAmc ? 'application' : 'request'} and contact you to confirm{' '}
                {isAmc ? 'the details of your plan' : 'a visit time'}.
              </li>
              {settings.responseTime ? <li>{settings.responseTime}</li> : null}
              <li>A technician visits at the agreed time and you pay after the service.</li>
            </ol>
          </div>
          <div className="grid gap-3">
            <h2 className="text-h3 font-bold">Want to speed things up?</h2>
            <p>
              Send photos or a short video of the issue on WhatsApp. Your reference number is
              already in the message.
            </p>
            <div className="flex flex-wrap gap-3">
              {wa ? (
                <ButtonLink
                  href={wa}
                  external
                  variant="whatsapp"
                  icon="whatsapp"
                  data-track="whatsapp_click"
                  data-track-location="thank_you"
                >
                  Send photos on WhatsApp
                </ButtonLink>
              ) : null}
              <ButtonLink href={routes.home} variant="secondary">
                Back to the homepage
              </ButtonLink>
            </div>
          </div>
          <ArrowLink href={routes.services}>Browse our services</ArrowLink>
        </div>
      </Section>
    </>
  )
}
