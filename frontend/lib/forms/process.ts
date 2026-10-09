/**
 * The lead pipeline (CLAUDE.md §12), as a pure function with injected dependencies so every
 * failure mode is unit-tested. Order: spam checks → validation → reference → webhook (with
 * retries) → owner email (always, the safety net) → customer email → result.
 * A lead is never silently dropped: if neither the webhook nor the owner email succeeds the
 * caller returns 503 and shows the visitor WhatsApp/phone fallbacks.
 */
import {
  fieldErrors,
  preferredTimeLabels,
  propertyTypeLabels,
  type AmcInput,
  type LeadInput,
  amcSchema,
  antiSpamSchema,
  quoteSchema,
} from './schema'

export type LeadPayload = {
  ref: string
  type: 'quote' | 'amc'
  createdAt: string
  service: string
  description: string
  emirate: string
  area: string
  address: string
  preferredDate: string
  preferredTime: string
  propertyType: string
  plan: string
  name: string
  phone: string
  email: string
  pageUrl: string
  utm: {source: string; medium: string; campaign: string}
}

export type Deps = {
  now: () => Date
  serviceSlugs: string[]
  serviceTitle: (slug: string) => string
  verifyTurnstile: (token: string) => Promise<boolean>
  turnstileRequired: boolean
  newReference: () => string
  sendWebhook: ((payload: LeadPayload) => Promise<{ok: boolean; error?: string}>) | null
  sendEmail: (email: {
    to: string | string[]
    subject: string
    text: string
    replyTo?: string
  }) => Promise<boolean>
  ownerEmail: string | undefined
  business: {name: string; phoneDisplay: string; whatsappE164: string; siteUrl: string}
  log: (event: Record<string, unknown>) => void
}

export type LeadResult =
  | {
      status: 'ok'
      ref: string
      type: 'quote' | 'amc'
      delivered: {webhook: boolean; ownerEmail: boolean; customerEmail: boolean}
    }
  | {status: 'spam'; ref: string; type: 'quote' | 'amc'}
  | {status: 'invalid'; type: 'quote' | 'amc'; errors: Record<string, string>}
  | {status: 'forbidden'; type: 'quote' | 'amc'; reason: string}
  | {status: 'undeliverable'; ref: string; type: 'quote' | 'amc'}

const MIN_FILL_MS = 3000

export async function processLead(raw: Record<string, unknown>, deps: Deps): Promise<LeadResult> {
  const type: 'quote' | 'amc' = raw.type === 'amc' ? 'amc' : 'quote'

  // 1. Anti-spam fields.
  const spam = antiSpamSchema.safeParse(raw)
  if (!spam.success) return {status: 'forbidden', type, reason: 'bad_form'}
  const now = deps.now()

  // Honeypot filled: look successful to the bot, deliver nothing.
  if (spam.data.website) {
    deps.log({event: 'lead_spam', reason: 'honeypot', type})
    return {status: 'spam', ref: deps.newReference(), type}
  }
  if (now.getTime() - spam.data.startedAt < MIN_FILL_MS) {
    deps.log({event: 'lead_spam', reason: 'too_fast', type})
    return {status: 'forbidden', type, reason: 'too_fast'}
  }
  if (deps.turnstileRequired && !(await deps.verifyTurnstile(spam.data.turnstileToken))) {
    deps.log({event: 'lead_spam', reason: 'turnstile', type})
    return {status: 'forbidden', type, reason: 'turnstile'}
  }

  // 2. Validation.
  const schema = type === 'amc' ? amcSchema : quoteSchema(deps.serviceSlugs, now)
  const parsed = schema.safeParse({...raw, type})
  if (!parsed.success) return {status: 'invalid', type, errors: fieldErrors(parsed.error)}
  const lead = parsed.data as LeadInput

  // 3. Reference and payload.
  const ref = deps.newReference()
  const payload = toPayload(lead, ref, now, spam.data)

  // 4. Webhook (Google Sheet + owner alert via Make/n8n).
  let webhookOk = false
  let webhookError: string | undefined
  if (deps.sendWebhook) {
    const res = await deps.sendWebhook(payload)
    webhookOk = res.ok
    webhookError = res.error
  } else {
    webhookError = 'not_configured'
  }

  // 5. Owner email: always, as the safety net.
  const subjectPrefix = webhookOk ? '' : '[WEBHOOK FAILED] '
  const ownerEmailOk = deps.ownerEmail
    ? await deps.sendEmail({
        to: deps.ownerEmail
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        subject: `${subjectPrefix}New ${type === 'amc' ? 'annual contract application' : 'quote request'} ${ref}: ${summaryTitle(payload, deps)}`,
        text: ownerText(payload, deps),
        replyTo: payload.email || undefined,
      })
    : false

  // 6. Customer confirmation (only with an email address).
  const customerEmailOk = payload.email
    ? await deps.sendEmail({
        to: payload.email,
        subject: `${deps.business.name}: we received your request (${ref})`,
        text: customerText(payload, deps),
      })
    : false

  deps.log({
    event: 'lead_processed',
    ref,
    type,
    webhook: webhookOk,
    webhookError,
    ownerEmail: ownerEmailOk,
    customerEmail: customerEmailOk,
  })

  if (!webhookOk && !ownerEmailOk) return {status: 'undeliverable', ref, type}
  return {
    status: 'ok',
    ref,
    type,
    delivered: {webhook: webhookOk, ownerEmail: ownerEmailOk, customerEmail: customerEmailOk},
  }
}

function toPayload(
  lead: LeadInput,
  ref: string,
  now: Date,
  meta: {pageUrl: string; utmSource: string; utmMedium: string; utmCampaign: string},
): LeadPayload {
  const base = {
    ref,
    createdAt: now.toISOString(),
    name: lead.name,
    phone: lead.phone,
    emirate: lead.emirate,
    area: lead.area,
    pageUrl: meta.pageUrl,
    utm: {source: meta.utmSource, medium: meta.utmMedium, campaign: meta.utmCampaign},
  }
  if (lead.type === 'amc') {
    const amc = lead as AmcInput
    return {
      ...base,
      type: 'amc',
      service: 'annual-maintenance-contract',
      description: '',
      address: '',
      preferredDate: '',
      preferredTime: '',
      propertyType: amc.propertyType,
      plan: amc.plan ?? '',
      email: '',
    }
  }
  return {
    ...base,
    type: 'quote',
    service: lead.service,
    description: lead.description,
    address: lead.address,
    preferredDate: lead.preferredDate,
    preferredTime: lead.preferredTime,
    propertyType: '',
    plan: '',
    email: lead.email ?? '',
  }
}

function summaryTitle(p: LeadPayload, deps: Deps) {
  return p.type === 'amc'
    ? `${p.plan || 'annual'} contract, ${p.area}`
    : `${deps.serviceTitle(p.service)}, ${p.area}`
}

function rows(p: LeadPayload, deps: Deps): Array<[string, string]> {
  return [
    ['Reference', p.ref],
    [
      'Request',
      p.type === 'amc'
        ? `Annual contract${p.plan ? ` (${p.plan})` : ''}`
        : deps.serviceTitle(p.service),
    ],
    ['Name', p.name],
    ['Phone', p.phone],
    ['Email', p.email],
    ['Emirate', p.emirate],
    ['Area', p.area],
    ['Address', p.address],
    [
      'Property',
      p.propertyType
        ? (propertyTypeLabels[p.propertyType as keyof typeof propertyTypeLabels] ?? p.propertyType)
        : '',
    ],
    ['Preferred date', p.preferredDate],
    [
      'Preferred time',
      p.preferredTime
        ? (preferredTimeLabels[p.preferredTime as keyof typeof preferredTimeLabels] ??
          p.preferredTime)
        : '',
    ],
  ].filter(([, v]) => v) as Array<[string, string]>
}

function ownerText(p: LeadPayload, deps: Deps) {
  const lines = rows(p, deps).map(([k, v]) => `${k}: ${v}`)
  if (p.description) lines.push('', 'Details:', p.description)
  lines.push(
    '',
    `Reply on WhatsApp: https://wa.me/${p.phone.replace(/\D/g, '')}`,
    `Sent from: ${p.pageUrl || deps.business.siteUrl}`,
  )
  if (p.utm.source || p.utm.campaign)
    lines.push(
      `Campaign: ${[p.utm.source, p.utm.medium, p.utm.campaign].filter(Boolean).join(' / ')}`,
    )
  return lines.join('\n')
}

function customerText(p: LeadPayload, deps: Deps) {
  const wa = deps.business.whatsappE164.replace(/\D/g, '')
  const msg = encodeURIComponent(`Hi IIM, my reference is ${p.ref}.`)
  return [
    `Hello ${p.name.split(' ')[0]},`,
    '',
    'Thank you for contacting us. We have your request and will contact you to confirm the visit. You pay after the service.',
    '',
    'Your details:',
    ...rows(p, deps).map(([k, v]) => `${k}: ${v}`),
    ...(p.description ? ['', p.description] : []),
    '',
    wa
      ? `To send photos or change anything, message us on WhatsApp: https://wa.me/${wa}?text=${msg}`
      : '',
    '',
    deps.business.name,
    deps.business.phoneDisplay,
    deps.business.siteUrl,
    '',
    `You received this email because you sent a request on our website. We use your details only for this request, as described in our privacy policy: ${deps.business.siteUrl}/privacy-policy/`,
  ].join('\n')
}
