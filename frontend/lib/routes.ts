/** Every fixed URL in one place (keep in sync with studio/sanity.config.ts). */
export const routes = {
  home: '/',
  services: '/services/',
  service: (slug: string) => `/services/${slug}/`,
  areas: '/areas/',
  area: (slug: string) => `/areas/${slug}/`,
  projects: '/projects/',
  project: (slug: string) => `/projects/${slug}/`,
  guides: '/guides/',
  guide: (slug: string) => `/guides/${slug}/`,
  amc: '/annual-maintenance-contract/',
  amcResidential: '/annual-maintenance-contract/residential/',
  amcCommercial: '/annual-maintenance-contract/commercial/',
  about: '/about/',
  reviews: '/reviews/',
  faq: '/faq/',
  contact: '/contact/',
  quote: '/get-a-quote/',
  thankYou: '/thank-you/',
  privacy: '/privacy-policy/',
  terms: '/terms/',
  accessibility: '/accessibility/',
  styleGuide: '/style-guide/',
} as const

/** Route for each fixed page key. */
export const pageKeyRoute: Record<string, string> = {
  home: routes.home,
  services: routes.services,
  areas: routes.areas,
  projects: routes.projects,
  guides: routes.guides,
  amc: routes.amc,
  'amc-residential': routes.amcResidential,
  'amc-commercial': routes.amcCommercial,
  about: routes.about,
  reviews: routes.reviews,
  faq: routes.faq,
  contact: routes.contact,
  'get-a-quote': routes.quote,
  'thank-you': routes.thankYou,
  'privacy-policy': routes.privacy,
  terms: routes.terms,
  accessibility: routes.accessibility,
}

/** Quote page with a preselected service (?need= avoids clashing with any `service` param). */
export function quoteUrl(serviceSlug?: string): string {
  return serviceSlug ? `${routes.quote}?need=${encodeURIComponent(serviceSlug)}` : routes.quote
}
