/**
 * Form constants and helpers with no dependencies, safe to import into client components
 * without pulling Zod into the page bundle (Zod loads on demand, see useLeadForm).
 */
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

export const propertyTypes = [
  'apartment',
  'villa',
  'townhouse',
  'office',
  'retail',
  'building',
  'other',
] as const
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
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Dubai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now)
}

export function addDays(isoDate: string, days: number): string {
  const d = new Date(`${isoDate}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

/** Field names in step order, used to show the first step with an error. */
export const quoteSteps = [
  ['service', 'description'],
  ['emirate', 'area', 'address', 'preferredDate', 'preferredTime'],
  ['name', 'phone', 'email', 'consent'],
] as const
