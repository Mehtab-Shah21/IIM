import {defineArrayMember, defineField, defineType} from 'sanity'

import {countedInput} from '../../components/CountedInput'

/** Icons available in the frontend icon set (frontend/components/icons/paths.ts). */
export const iconOptions = [
  'zap',
  'droplets',
  'snowflake',
  'paint-roller',
  'hammer',
  'house',
  'siren',
  'wrench',
  'shield-check',
  'wallet',
  'message-circle',
  'calendar-check',
  'clock',
  'users',
  'thumbs-up',
  'sparkles',
  'building-2',
  'badge-check',
  'check',
  'star',
  'camera',
  'map-pin',
  'clipboard-list',
].map((v) => ({title: v, value: v}))

export const imageWithAlt = defineType({
  name: 'imageWithAlt',
  title: 'Image',
  type: 'image',
  options: {hotspot: true},
  fields: [
    defineField({
      name: 'alt',
      title: 'Alt text',
      type: 'string',
      description:
        'What the photo shows, e.g. "Electrician testing a distribution board in a villa". Leave empty only for decorative images.',
    }),
  ],
})

export const faqItem = defineType({
  name: 'faqItem',
  title: 'Question',
  type: 'object',
  fields: [
    defineField({
      name: 'question',
      type: 'string',
      description: 'Phrase it the way customers ask it.',
      validation: (r) => r.required(),
    }),
    defineField({name: 'answer', type: 'text', rows: 4, validation: (r) => r.required()}),
  ],
  preview: {select: {title: 'question', subtitle: 'answer'}},
})

export const priceItem = defineType({
  name: 'priceItem',
  title: 'Price',
  type: 'object',
  fields: [
    defineField({name: 'name', type: 'string', validation: (r) => r.required()}),
    defineField({
      name: 'priceFrom',
      title: 'From (AED)',
      type: 'number',
      validation: (r) => r.required().min(0),
    }),
    defineField({name: 'note', type: 'string'}),
  ],
  preview: {
    select: {title: 'name', price: 'priceFrom'},
    prepare: ({title, price}) => ({title, subtitle: price ? `From AED ${price}` : ''}),
  },
})

export const openingHours = defineType({
  name: 'openingHours',
  title: 'Opening hours',
  type: 'object',
  fields: [
    defineField({
      name: 'days',
      type: 'array',
      of: [defineArrayMember({type: 'string'})],
      options: {
        list: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        layout: 'grid',
      },
      validation: (r) => r.required().min(1),
    }),
    defineField({
      name: 'opens',
      type: 'string',
      description: '24-hour time, e.g. 08:00',
      validation: (r) => r.required().regex(/^([01]\d|2[0-3]):[0-5]\d$/, {name: 'HH:MM'}),
    }),
    defineField({
      name: 'closes',
      type: 'string',
      description: '24-hour time, e.g. 22:00 (use 23:59 for midnight)',
      validation: (r) => r.required().regex(/^([01]\d|2[0-3]):[0-5]\d$/, {name: 'HH:MM'}),
    }),
  ],
  preview: {
    select: {days: 'days', opens: 'opens', closes: 'closes'},
    prepare: ({days, opens, closes}) => ({
      title: Array.isArray(days) ? days.map((d: string) => d.slice(0, 3)).join(', ') : '',
      subtitle: `${opens ?? ''}–${closes ?? ''}`,
    }),
  },
})

export const socialLink = defineType({
  name: 'socialLink',
  title: 'Social profile',
  type: 'object',
  fields: [
    defineField({
      name: 'network',
      type: 'string',
      options: {list: ['Facebook', 'Instagram', 'LinkedIn', 'TikTok', 'YouTube', 'X']},
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'url',
      type: 'url',
      validation: (r) =>
        r
          .required()
          .uri({scheme: ['https']})
          .custom((v) =>
            v && /wix\.com|facebook\.com\/wix|linkedin\.com\/company\/wix/i.test(v)
              ? 'This is a Wix template link, not a real profile.'
              : true,
          ),
    }),
  ],
  preview: {select: {title: 'network', subtitle: 'url'}},
})

export const stat = defineType({
  name: 'stat',
  title: 'Number',
  type: 'object',
  fields: [
    defineField({name: 'value', type: 'number', validation: (r) => r.required().min(0)}),
    defineField({
      name: 'suffix',
      type: 'string',
      description: 'e.g. +',
      validation: (r) => r.max(3),
    }),
    defineField({name: 'label', type: 'string', validation: (r) => r.required()}),
  ],
  preview: {
    select: {value: 'value', suffix: 'suffix', label: 'label'},
    prepare: ({value, suffix, label}) => ({
      title: `${value ?? ''}${suffix ?? ''}`,
      subtitle: label,
    }),
  },
})

export const personRef = defineType({
  name: 'personRef',
  title: 'Person',
  type: 'object',
  fields: [
    defineField({name: 'name', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'role', type: 'string'}),
    defineField({
      name: 'credentials',
      type: 'string',
      description: 'Licence or certification, only if real.',
    }),
  ],
})

export const iconItem = defineType({
  name: 'iconItem',
  title: 'Item',
  type: 'object',
  fields: [
    defineField({
      name: 'icon',
      type: 'string',
      options: {list: iconOptions},
      initialValue: 'check',
    }),
    defineField({name: 'title', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'text', type: 'text', rows: 2}),
  ],
  preview: {select: {title: 'title', subtitle: 'text'}},
})

/** A 40–60 word direct answer, opening every service, area and guide page (AEO). */
export const directAnswerField = defineField({
  name: 'directAnswer',
  title: 'Direct answer (40–60 words)',
  type: 'text',
  rows: 4,
  description:
    'Answer the main question of this page first, in plain words. Answer engines quote this.',
  components: {input: countedInput({min: 40, max: 60, unit: 'words'})},
  validation: (rule) =>
    rule.required().custom((value) => {
      const words = (value ?? '').trim().split(/\s+/).filter(Boolean).length
      return words >= 40 && words <= 60 ? true : `Use 40 to 60 words (now ${words}).`
    }),
})

export const lastReviewedField = defineField({
  name: 'lastReviewed',
  title: 'Last reviewed',
  type: 'date',
  description: 'Shown on the page. Update it whenever you check the content is still accurate.',
})

export const slugField = (source = 'title') =>
  defineField({
    name: 'slug',
    type: 'slug',
    options: {source, maxLength: 80},
    description: 'Lowercase words joined by hyphens. Changing it changes the URL: add a redirect.',
    validation: (r) =>
      r
        .required()
        .custom((v) =>
          v?.current && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v.current)
            ? 'Use lowercase letters, numbers and hyphens only.'
            : true,
        ),
  })
