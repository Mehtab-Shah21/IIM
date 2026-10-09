/**
 * Shared validation for the quote and annual-contract forms (CLAUDE.md §12). Used by the
 * client components (inline errors) and the /api/quote route (authoritative check).
 */
import {z} from 'zod'

import {
  addDays,
  dubaiToday,
  emirates,
  normaliseUaePhone,
  plans,
  preferredTimes,
  propertyTypes,
} from './constants'

export * from './constants'

const text = (min: number, max: number, label: string) =>
  z
    .string({error: `Please enter ${label}.`})
    .trim()
    .min(min, min <= 1 ? `Please enter ${label}.` : `Please enter at least ${min} characters.`)
    .max(max, `Please keep this under ${max} characters.`)

const phone = z
  .string({error: 'Please enter your mobile number.'})
  .trim()
  .min(1, 'Please enter your mobile number.')
  .transform((v, ctx) => {
    const e164 = normaliseUaePhone(v)
    if (!e164) {
      ctx.addIssue({code: 'custom', message: 'Enter a UAE number, for example 050 123 4567.'})
      return z.NEVER
    }
    return e164
  })

const email = z
  .string()
  .trim()
  .max(150)
  .optional()
  .transform((v) => (v ? v : undefined))
  .pipe(z.email('Enter a valid email address, or leave it empty.').optional())

const consent = z
  .union([z.literal('on'), z.literal('true'), z.literal(true)], {
    error: 'Please agree so we can contact you about this request.',
  })
  .transform(() => true as const)

const emirate = z.enum(emirates, {error: 'Please choose an emirate.'})

/** Fields used for spam checks; validated separately from the visible fields. */
export const antiSpamSchema = z.object({
  // Honeypot: any value is accepted here so processLead can quietly drop the bot.
  website: z.string().max(500).optional().default(''),
  startedAt: z.coerce.number().int().positive(),
  turnstileToken: z.string().max(4096).optional().default(''),
  pageUrl: z.string().max(500).optional().default(''),
  utmSource: z.string().max(100).optional().default(''),
  utmMedium: z.string().max(100).optional().default(''),
  utmCampaign: z.string().max(100).optional().default(''),
})

export function quoteSchema(serviceSlugs: readonly string[], now: Date = new Date()) {
  const today = dubaiToday(now)
  const last = addDays(today, 60)
  return z.object({
    type: z.literal('quote'),
    service: z
      .string({error: 'Please choose a service.'})
      .refine((v) => serviceSlugs.includes(v) || v === 'other', 'Please choose a service.'),
    description: text(10, 1000, 'a short description'),
    emirate,
    area: text(2, 80, 'your area'),
    address: z
      .string()
      .trim()
      .max(200, 'Please keep this under 200 characters.')
      .optional()
      .default(''),
    preferredDate: z
      .string({error: 'Please choose a date.'})
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Please choose a date.')
      .refine((d) => d >= today, 'Choose today or a later date.')
      .refine((d) => d <= last, 'Choose a date within the next 60 days.'),
    preferredTime: z.enum(preferredTimes, {error: 'Please choose a time.'}),
    name: text(2, 80, 'your name'),
    phone,
    email,
    consent,
  })
}

export const amcSchema = z.object({
  type: z.literal('amc'),
  name: text(2, 80, 'your name'),
  phone,
  emirate,
  area: text(2, 80, 'your area or building'),
  propertyType: z.enum(propertyTypes, {error: 'Please choose a property type.'}),
  plan: z.enum(plans).optional(),
  consent,
})

export type QuoteInput = z.infer<ReturnType<typeof quoteSchema>>
export type AmcInput = z.infer<typeof amcSchema>
export type LeadInput = QuoteInput | AmcInput

export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {}
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? 'form')
    out[key] ??= issue.message
  }
  return out
}
