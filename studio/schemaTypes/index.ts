import {area, faq, guide, page, project, service, testimonial} from './documents/content'
import {redirect} from './documents/redirect'
import {siteSettings} from './documents/siteSettings'
import {
  faqItem,
  iconItem,
  imageWithAlt,
  openingHours,
  personRef,
  priceItem,
  socialLink,
  stat,
} from './objects/common'
import {
  articleText,
  calloutSection,
  checklistSection,
  ctaBandSection,
  faqListSection,
  gallerySection,
  imageTextSection,
  portableText,
  proofPointsSection,
  relatedServicesSection,
  richTextSection,
  stepsSection,
} from './objects/sections'
import {seo} from './objects/seo'

export const schemaTypes = [
  // documents
  siteSettings,
  page,
  service,
  area,
  project,
  testimonial,
  faq,
  guide,
  redirect,
  // objects
  seo,
  imageWithAlt,
  faqItem,
  priceItem,
  openingHours,
  socialLink,
  stat,
  personRef,
  iconItem,
  portableText,
  articleText,
  richTextSection,
  imageTextSection,
  stepsSection,
  proofPointsSection,
  checklistSection,
  calloutSection,
  gallerySection,
  ctaBandSection,
  faqListSection,
  relatedServicesSection,
]

/** Documents that exist once and cannot be created, duplicated or deleted from the UI. */
export const singletonTypes = new Set(['siteSettings'])
