import {TransferIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

const pathPattern = /^\/[^\s?#]*$/

/**
 * Redirects applied at runtime by the frontend proxy (refreshed at most every 60 seconds).
 * Loops and chains are detected and skipped, and logged by the site.
 */
export const redirect = defineType({
  name: 'redirect',
  title: 'Redirect',
  type: 'document',
  icon: TransferIcon,
  fields: [
    defineField({
      name: 'from',
      type: 'string',
      description: 'Old path, starting with /. Example: /about-us',
      validation: (r) =>
        r
          .required()
          .regex(pathPattern, {name: 'path starting with / and no spaces'})
          .custom(async (from, context) => {
            if (!from) return true
            const client = context.getClient({apiVersion: '2026-10-01'})
            const id = (context.document?._id ?? '').replace(/^drafts\./, '')
            const normal = from.replace(/\/+$/, '').toLowerCase() || '/'
            const dupes = await client.fetch<string[]>(
              '*[_type == "redirect" && !(_id in [$id, "drafts." + $id])].from',
              {id},
            )
            return dupes.some((d) => (d.replace(/\/+$/, '').toLowerCase() || '/') === normal)
              ? 'Another redirect already uses this path.'
              : true
          }),
    }),
    defineField({
      name: 'type',
      type: 'string',
      options: {
        list: [
          {title: '301 Permanent (normal)', value: '301'},
          {title: '302 Temporary', value: '302'},
          {title: '410 Gone (page removed, no replacement)', value: '410'},
        ],
        layout: 'radio',
      },
      initialValue: '301',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'to',
      type: 'string',
      description: 'New path (/services/…) or full https:// URL. Not used for 410.',
      hidden: ({parent}) => parent?.type === '410',
      validation: (r) =>
        r.custom((to, context) => {
          const parent = context.parent as {type?: string; from?: string} | undefined
          if (parent?.type === '410') return true
          if (!to) return 'Required.'
          if (!pathPattern.test(to) && !/^https:\/\//.test(to)) return 'Use a path starting with / or an https:// URL.'
          if (parent?.from && to.replace(/\/+$/, '') === parent.from.replace(/\/+$/, '')) return 'A redirect cannot point to itself.'
          return true
        }),
    }),
    defineField({name: 'note', type: 'string', description: 'Why this redirect exists.'}),
  ],
  preview: {
    select: {from: 'from', to: 'to', type: 'type'},
    prepare: ({from, to, type}) => ({title: from, subtitle: type === '410' ? '410 Gone' : `${type} → ${to}`}),
  },
})
