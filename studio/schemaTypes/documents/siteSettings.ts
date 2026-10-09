import {CogIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

/**
 * Business info: the single source of every contact detail and trust claim on the site.
 * Claims (24/7, DEWA, free quotes, rating, prices) stay hidden until switched on here, which
 * should only happen after the owner confirms them in writing (PLACEHOLDERS.md).
 */
export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Business info and settings',
  type: 'document',
  icon: CogIcon,
  groups: [
    {name: 'contact', title: 'Contact', default: true},
    {name: 'claims', title: 'Trust and claims'},
    {name: 'reviews', title: 'Reviews and numbers'},
    {name: 'social', title: 'Social'},
    {name: 'site', title: 'Site'},
  ],
  fields: [
    defineField({name: 'businessName', type: 'string', group: 'contact', validation: (r) => r.required()}),
    defineField({name: 'legalName', title: 'Legal name (as on the trade licence)', type: 'string', group: 'contact'}),
    defineField({
      name: 'phoneDisplay',
      title: 'Phone (as shown)',
      type: 'string',
      group: 'contact',
      description: 'Example: +971 50 962 6446',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'phoneE164',
      title: 'Phone (international format)',
      type: 'string',
      group: 'contact',
      description: 'Used for call links and schema. Example: +971509626446',
      validation: (r) => r.required().regex(/^\+971\d{8,9}$/, {name: '+971 number'}),
    }),
    defineField({
      name: 'whatsappE164',
      title: 'WhatsApp (international format)',
      type: 'string',
      group: 'contact',
      validation: (r) => r.required().regex(/^\+971\d{8,9}$/, {name: '+971 number'}),
    }),
    defineField({name: 'email', title: 'Public email', type: 'string', group: 'contact', validation: (r) => r.email()}),
    defineField({
      name: 'address',
      type: 'object',
      group: 'contact',
      description: 'Must match the Google Business Profile exactly.',
      fields: [
        defineField({name: 'street', title: 'Street / area', type: 'string'}),
        defineField({name: 'locality', title: 'City', type: 'string', initialValue: 'Dubai'}),
        defineField({name: 'region', title: 'Emirate', type: 'string', initialValue: 'Dubai'}),
        defineField({name: 'country', title: 'Country code', type: 'string', initialValue: 'AE'}),
      ],
    }),
    defineField({
      name: 'geo',
      type: 'object',
      group: 'contact',
      fields: [
        defineField({name: 'lat', type: 'number'}),
        defineField({name: 'lng', type: 'number'}),
      ],
    }),
    defineField({name: 'hoursText', title: 'Working hours (as shown)', type: 'string', group: 'contact'}),
    defineField({
      name: 'openingHours',
      title: 'Working hours (for Google)',
      type: 'array',
      group: 'contact',
      of: [defineArrayMember({type: 'openingHours'})],
    }),
    defineField({
      name: 'serviceAreas',
      title: 'Areas served (names)',
      type: 'array',
      group: 'contact',
      description: 'Used for areaServed in schema when no Area pages exist yet.',
      of: [defineArrayMember({type: 'string'})],
    }),

    defineField({name: 'licenceNumber', title: 'Trade licence number', type: 'string', group: 'claims'}),
    defineField({name: 'licenceAuthority', title: 'Issuing authority', type: 'string', group: 'claims'}),
    defineField({name: 'is247', title: 'Offer 24/7 emergency service', type: 'boolean', group: 'claims', initialValue: false}),
    defineField({name: 'dewaShow', title: 'Show the DEWA compliance claim', type: 'boolean', group: 'claims', initialValue: false}),
    defineField({name: 'dewaShort', title: 'DEWA claim (short)', type: 'string', group: 'claims', initialValue: 'DEWA-compliant work'}),
    defineField({name: 'dewaText', title: 'DEWA proof (full text)', type: 'text', rows: 2, group: 'claims'}),
    defineField({name: 'insuranceText', title: 'Insurance details', type: 'text', rows: 2, group: 'claims'}),
    defineField({name: 'freeQuotes', title: 'Quotes are free', type: 'boolean', group: 'claims', initialValue: false}),
    defineField({name: 'responseTime', title: 'Response-time statement', type: 'string', group: 'claims', description: 'Only a confirmed, specific statement.'}),
    defineField({name: 'warranty', title: 'Workmanship warranty', type: 'string', group: 'claims'}),
    defineField({name: 'showPrices', title: 'Show prices on the site', type: 'boolean', group: 'claims', initialValue: false}),
    defineField({name: 'priceNote', title: 'Note under price lists', type: 'string', group: 'claims'}),

    defineField({name: 'gbpUrl', title: 'Google Business Profile link', type: 'url', group: 'reviews'}),
    defineField({name: 'reviewUrl', title: 'Google reviews link', type: 'url', group: 'reviews'}),
    defineField({name: 'ratingShow', title: 'Show the Google rating', type: 'boolean', group: 'reviews', initialValue: false}),
    defineField({name: 'ratingValue', title: 'Rating (out of 5)', type: 'number', group: 'reviews', validation: (r) => r.min(1).max(5).precision(1)}),
    defineField({name: 'ratingCount', title: 'Number of reviews', type: 'number', group: 'reviews', validation: (r) => r.min(0).integer()}),
    defineField({
      name: 'stats',
      title: 'Company numbers',
      type: 'array',
      group: 'reviews',
      description: 'Real figures only. The homepage section is hidden while this is empty.',
      of: [defineArrayMember({type: 'stat'})],
      validation: (r) => r.max(4),
    }),

    defineField({name: 'socials', title: 'Social profiles', type: 'array', group: 'social', of: [defineArrayMember({type: 'socialLink'})]}),

    defineField({name: 'footerDescription', type: 'text', rows: 2, group: 'site', validation: (r) => r.max(200)}),
    defineField({name: 'defaultWhatsappMessage', type: 'string', group: 'site'}),
    defineField({name: 'defaultOgImage', title: 'Default share image (1200 × 630)', type: 'imageWithAlt', group: 'site'}),
    defineField({
      name: 'allowAiTraining',
      title: 'Allow AI training crawlers (GPTBot, Google-Extended, CCBot)',
      type: 'boolean',
      group: 'site',
      initialValue: true,
      description: 'Search and answer crawlers are always allowed. This only controls crawlers that collect training data.',
    }),
  ],
  preview: {prepare: () => ({title: 'Business info and settings'})},
})
