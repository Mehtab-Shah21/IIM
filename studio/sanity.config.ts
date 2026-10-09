import {visionTool} from '@sanity/vision'
import {defineConfig} from 'sanity'
import {
  defineDocuments,
  defineLocations,
  presentationTool,
  type DocumentLocation,
} from 'sanity/presentation'
import {structureTool} from 'sanity/structure'

import {schemaTypes, singletonTypes} from './schemaTypes'
import {structure} from './structure'

const projectId = process.env.SANITY_STUDIO_PROJECT_ID || 'placeholder'
const dataset = process.env.SANITY_STUDIO_DATASET || 'production'
const previewOrigin = process.env.SANITY_STUDIO_PREVIEW_URL || 'http://localhost:3000'

/** Routes of the fixed pages (keep in sync with frontend/lib/routes.ts). */
const pageRoutes: Record<string, string> = {
  home: '/',
  services: '/services/',
  areas: '/areas/',
  projects: '/projects/',
  guides: '/guides/',
  amc: '/annual-maintenance-contract/',
  'amc-residential': '/annual-maintenance-contract/residential/',
  'amc-commercial': '/annual-maintenance-contract/commercial/',
  about: '/about/',
  reviews: '/reviews/',
  faq: '/faq/',
  contact: '/contact/',
  'get-a-quote': '/get-a-quote/',
  'thank-you': '/thank-you/',
  'privacy-policy': '/privacy-policy/',
  terms: '/terms/',
  accessibility: '/accessibility/',
}

const home = {title: 'Home', href: '/'} satisfies DocumentLocation

export default defineConfig({
  name: 'default',
  title: 'IIM Technical Services',
  projectId,
  dataset,
  plugins: [
    structureTool({structure}),
    presentationTool({
      previewUrl: {origin: previewOrigin, previewMode: {enable: '/api/draft-mode/enable/'}},
      resolve: {
        mainDocuments: defineDocuments([
          ...Object.entries(pageRoutes).map(([key, route]) => ({
            route,
            filter: `_type == "page" && key == "${key}"`,
          })),
          {route: '/services/:slug/', filter: '_type == "service" && slug.current == $slug'},
          {route: '/areas/:slug/', filter: '_type == "area" && slug.current == $slug'},
          {route: '/projects/:slug/', filter: '_type == "project" && slug.current == $slug'},
          {route: '/guides/:slug/', filter: '_type == "guide" && slug.current == $slug'},
        ]),
        locations: {
          siteSettings: defineLocations({
            locations: [home],
            message: 'Used on every page (header, footer, contact details, schema)',
            tone: 'positive',
          }),
          page: defineLocations({
            select: {title: 'title', key: 'key'},
            resolve: (doc) => ({
              locations:
                doc?.key && pageRoutes[doc.key]
                  ? [{title: doc.title || 'Page', href: pageRoutes[doc.key]!}]
                  : [],
            }),
          }),
          service: defineLocations({
            select: {title: 'title', slug: 'slug.current'},
            resolve: (doc) => ({
              locations: [
                {title: doc?.title || 'Service', href: `/services/${doc?.slug}/`},
                {title: 'Services', href: '/services/'},
                home,
              ],
            }),
          }),
          area: defineLocations({
            select: {title: 'title', slug: 'slug.current'},
            resolve: (doc) => ({
              locations: [{title: doc?.title || 'Area', href: `/areas/${doc?.slug}/`}],
            }),
          }),
          guide: defineLocations({
            select: {title: 'title', slug: 'slug.current'},
            resolve: (doc) => ({
              locations: [{title: doc?.title || 'Guide', href: `/guides/${doc?.slug}/`}],
            }),
          }),
          project: defineLocations({
            select: {title: 'title', slug: 'slug.current'},
            resolve: (doc) => ({
              locations: [{title: doc?.title || 'Project', href: `/projects/${doc?.slug}/`}, home],
            }),
          }),
          faq: defineLocations({locations: [{title: 'FAQ', href: '/faq/'}, home]}),
          testimonial: defineLocations({locations: [{title: 'Reviews', href: '/reviews/'}, home]}),
        },
      },
    }),
    visionTool(),
  ],
  schema: {
    types: schemaTypes,
    // Singletons cannot be created from the "new document" menu.
    templates: (templates) => templates.filter(({schemaType}) => !singletonTypes.has(schemaType)),
  },
  document: {
    // Singletons cannot be duplicated, unpublished or deleted.
    actions: (input, context) =>
      singletonTypes.has(context.schemaType)
        ? input.filter(
            ({action}) => action && ['publish', 'discardChanges', 'restore'].includes(action),
          )
        : input,
  },
})
