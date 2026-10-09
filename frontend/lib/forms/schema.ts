/**
 * Shared validation for the quote and annual-contract forms (CLAUDE.md §12). Used by the
 * client components (inline errors) and the /api/quote route (authoritative check).
 */
import {z} from 'zod'

export const emirates = [
  'Dubai',
  'Sharjah',
  'Abu Dhabi',
  'Ajman',
  'Umm Al Quwain',
  'Ras Al Khaimah',
  'Fujairah',
] as const

export const preferredTimes = ['asap', 'morning', 'afternoon', 'evening'] as const
export const preferredTimeLabels: Record<(typeof preferredTimes)[number], string> = {
  asap: 'As soon as possible',
  morning: 'Morning',
  afternoon: 'Afternoon',
  evening: 'Evening',
}

export const propertyTypes = ['apartment', 'villa', 'townhouse', 'office', 'retail', 'building', 'other'] as const
export const propertyTypeLabels: Record<(typeof propertyTypes)[number], string> = {
  apartment: 'Apartment',
  villa: 'Villa',
  townhouse: 'Townhouse',
  office: 'Office',
  retail: 'Shop or retail unit',
  building: 'Whole building',
  other: 'Other',
}

export const plans = ['residential', 'commercial'] as const

/** UAE numbers: +971 / 00971 / 0 prefix; mobile 5[0,2,4,5,6,8] + 7 digits; landline area code + 7 digits. */
const UAE_PHONE = /^(?:\+971|00971|971|0)?(5[024568]\d{7}|[234679]\d{7})$/

/** Normalises a UAE phone number to E.164 (+9715XXXXXXXX), or returns null if invalid. */
export function normaliseUaePhone(raw: string): string | null {
  const compact = raw.replace(/[\s\-().]/g, '')
  const match = UAE_PHONE.exec(compact)
  return match ? `+971${match[1]}` : null
}

/** Today's date in Dubai as YYYY-MM-DD. */
export function dubaiToday(now: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {timeZone: 'Asia/Dubai', year: 'numeric', month: '2-digit', day: '2-digit'}).format(now)
}

export function addDays(isoDate: string, days: number): string {
  const d = new Date(`${isoDate}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

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
  .union([z.literal('on'), z.literal('true'), z.literal(true)], {error: 'Please agree so we can contact you about this request.'})
  .transform(() => true as const)

const emirate = z.enum(emirates, {error: 'Please choose an emirate.'})

/** Fields used for spam checks; validated separately from the visible fields. */
export const antiSpamSchema = z.object({
  website: z.string().max(0).optional().default(''),
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
    service: z.string({error: 'Please choose a service.'}).refine((v) => serviceSlugs.includes(v) || v === 'other', 'Please choose a service.'),
    description: text(10, 1000, 'a short description'),
    emirate,
    area: text(2, 80, 'your area'),
    address: z.string().trim().max(200, 'Please keep this under 200 characters.').optional().default(''),
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

/** Field names in step order, used to show the first step with an error. */
export const quoteSteps = [
  ['service', 'description'],
  ['emirate', 'area', 'address', 'preferredDate', 'preferredTime'],
  ['name', 'phone', 'email', 'consent'],
] as const

export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {}
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? 'form')
    out[key] ??= issue.message
  }
  return out
}
