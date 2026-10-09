/**
 * Content API used by every page. Each function runs one typed GROQ query (lib/sanity/queries)
 * and is memoised per request with React `cache`. Cache tags let /api/revalidate refresh a
 * document type when Sanity publishes.
 */
import {cache} from 'react'

import {isLiveSite, isSanityConfigured} from '@/lib/env'
import {sanityQuery} from '@/lib/sanity/fetch'
import {
  amcPlansQuery,
  areaQuery,
  areasQuery,
  faqsQuery,
  guideQuery,
  guidesQuery,
  pageQuery,
  projectQuery,
  projectsQuery,
  publishedPageKeysQuery,
  redirectsQuery,
  serviceQuery,
  servicesQuery,
  settingsQuery,
  sitemapQuery,
  slugsQuery,
  testimonialsQuery,
} from '@/lib/sanity/queries'

export type PageKey =
  | 'home'
  | 'services'
  | 'areas'
  | 'projects'
  | 'guides'
  | 'amc'
  | 'amc-residential'
  | 'amc-commercial'
  | 'about'
  | 'reviews'
  | 'faq'
  | 'contact'
  | 'get-a-quote'
  | 'thank-you'
  | 'privacy-policy'
  | 'terms'
  | 'accessibility'

export const getSettings = cache(async () => {
  const settings = await sanityQuery(settingsQuery, {}, {tags: ['siteSettings']})
  if (!settings)
    throw new Error(
      'The siteSettings document is missing. Run the seed import (docs/MANUAL_TASKS.md T2).',
    )
  return settings
})

export const getServices = cache(() => sanityQuery(servicesQuery, {}, {tags: ['service']}))
export const getService = cache((slug: string) =>
  sanityQuery(serviceQuery, {slug}, {tags: ['service', 'project']}),
)
export const getPage = cache((key: PageKey) =>
  sanityQuery(pageQuery, {key}, {tags: ['page', 'project', 'service']}),
)
/**
 * Pages that may be previewed as drafts on a non-live site (review deployment, local), so
 * links to them work while they wait for sign-off: the privacy policy and terms (legal review,
 * PLACEHOLDERS A23). Never on production or staging, and never other drafts (they may hold
 * unconfirmed claims).
 */
export const reviewDraftKeys = ['privacy-policy', 'terms'] as const

export const getReviewDraftPage = cache(async (key: PageKey) => {
  if (isLiveSite() || isSanityConfigured) return null
  if (!(reviewDraftKeys as readonly string[]).includes(key)) return null
  const {evaluateFixture} = await import('@/lib/sanity/fixtures')
  return evaluateFixture<Awaited<ReturnType<typeof getPage>>>(pageQuery, {key}, {drafts: true})
})

export const getPublishedPageKeys = cache(
  async () => new Set(await sanityQuery(publishedPageKeysQuery, {}, {tags: ['page']})),
)
export const getAmcPlans = cache(() => sanityQuery(amcPlansQuery, {}, {tags: ['page']}))
export const getFaqs = cache(() => sanityQuery(faqsQuery, {}, {tags: ['faq']}))
export const getTestimonials = cache(() =>
  sanityQuery(testimonialsQuery, {}, {tags: ['testimonial']}),
)
export const getAreas = cache(() => sanityQuery(areasQuery, {}, {tags: ['area']}))
export const getArea = cache((slug: string) =>
  sanityQuery(areaQuery, {slug}, {tags: ['area', 'service']}),
)
export const getProjects = cache(() => sanityQuery(projectsQuery, {}, {tags: ['project']}))
export const getProject = cache((slug: string) =>
  sanityQuery(projectQuery, {slug}, {tags: ['project', 'service']}),
)
export const getGuides = cache(() => sanityQuery(guidesQuery, {}, {tags: ['guide']}))
export const getGuide = cache((slug: string) =>
  sanityQuery(guideQuery, {slug}, {tags: ['guide', 'service']}),
)
export const getRedirects = cache(() => sanityQuery(redirectsQuery, {}, {tags: ['redirect']}))
export const getSitemapData = cache(() =>
  sanityQuery(sitemapQuery, {}, {tags: ['page', 'service', 'area', 'project', 'guide']}),
)
export const getSlugs = cache((type: 'service' | 'area' | 'project' | 'guide') =>
  sanityQuery(slugsQuery, {type}, {tags: [type]}),
)

export type Settings = Awaited<ReturnType<typeof getSettings>>
export type ServiceCard = Awaited<ReturnType<typeof getServices>>[number]
export type ServiceDoc = NonNullable<Awaited<ReturnType<typeof getService>>>
export type PageDoc = NonNullable<Awaited<ReturnType<typeof getPage>>>
export type Faq = Awaited<ReturnType<typeof getFaqs>>[number]
export type Testimonial = Awaited<ReturnType<typeof getTestimonials>>[number]
export type Sections = NonNullable<PageDoc['sections']>
export type Section = Sections[number]
