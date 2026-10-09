/**
 * Environment variables, validated once with Zod.
 *
 * - Public values (NEXT_PUBLIC_*) are inlined into the client bundle by Next.js.
 * - Server values must only be imported from server code (route handlers, server components).
 * - In production and staging, missing required values fail fast with a readable message.
 *   Locally and in CI the site runs on fixtures, so Sanity, SMTP and the webhook are optional.
 */
import {z} from 'zod'

const siteEnv = z.enum(['production', 'staging', 'development', 'test']).default('development')

const optionalString = z
  .string()
  .optional()
  .transform((v) => (v && v.trim() !== '' ? v.trim() : undefined))

const publicSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.url().default('https://www.iimtechnicalservices.com'),
  NEXT_PUBLIC_SANITY_PROJECT_ID: optionalString,
  NEXT_PUBLIC_SANITY_DATASET: z.string().default('production'),
  NEXT_PUBLIC_SANITY_API_VERSION: z.string().default('2026-10-01'),
  NEXT_PUBLIC_SANITY_STUDIO_URL: z.url().default('http://localhost:3333'),
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: optionalString,
  NEXT_PUBLIC_GA_ID: optionalString,
})

const serverSchema = z.object({
  SITE_ENV: siteEnv,
  STAGING_BASIC_AUTH: optionalString,
  SANITY_API_READ_TOKEN: optionalString,
  SANITY_REVALIDATE_SECRET: optionalString,
  LEAD_WEBHOOK_URL: optionalString.pipe(z.url().optional()),
  LEAD_WEBHOOK_SECRET: optionalString,
  TURNSTILE_SECRET_KEY: optionalString,
  SMTP_HOST: optionalString,
  SMTP_PORT: z.coerce.number().int().positive().default(465),
  SMTP_USER: optionalString,
  SMTP_PASS: optionalString,
  MAIL_FROM: z.string().default('IIM Technical Services <no-reply@iimtechnicalservices.com>'),
  OWNER_EMAIL: optionalString,
  ENABLE_UPLOADS: z
    .enum(['true', 'false'])
    .default('false')
    .transform((v) => v === 'true'),
  CSP_MODE: z.enum(['report-only', 'enforce']).default('report-only'),
})

/** Values that must be present on a live (production or staging) deployment. */
const liveRequired = [
  'NEXT_PUBLIC_SANITY_PROJECT_ID',
  'LEAD_WEBHOOK_URL',
  'LEAD_WEBHOOK_SECRET',
  'NEXT_PUBLIC_TURNSTILE_SITE_KEY',
  'TURNSTILE_SECRET_KEY',
  'SMTP_HOST',
  'SMTP_USER',
  'SMTP_PASS',
  'OWNER_EMAIL',
  'SANITY_REVALIDATE_SECRET',
] as const

function format(error: z.ZodError): string {
  return error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`).join('\n')
}

// Next.js only inlines NEXT_PUBLIC_* values that are referenced literally.
const publicInput = {
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_SANITY_PROJECT_ID: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  NEXT_PUBLIC_SANITY_DATASET: process.env.NEXT_PUBLIC_SANITY_DATASET,
  NEXT_PUBLIC_SANITY_API_VERSION: process.env.NEXT_PUBLIC_SANITY_API_VERSION,
  NEXT_PUBLIC_SANITY_STUDIO_URL: process.env.NEXT_PUBLIC_SANITY_STUDIO_URL,
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
  NEXT_PUBLIC_GA_ID: process.env.NEXT_PUBLIC_GA_ID,
}

const parsedPublic = publicSchema.safeParse(publicInput)
if (!parsedPublic.success) {
  throw new Error(`Invalid public environment variables:\n${format(parsedPublic.error)}`)
}

export const publicEnv = parsedPublic.data

/** Server-only environment. Never import this into a client component. */
export function getServerEnv() {
  const parsed = serverSchema.safeParse(process.env)
  if (!parsed.success) {
    throw new Error(`Invalid server environment variables:\n${format(parsed.error)}`)
  }
  const env = {...parsed.data, ...publicEnv}
  if (env.SITE_ENV === 'production' || env.SITE_ENV === 'staging') {
    const missing = liveRequired.filter((k) => !env[k])
    if (missing.length) {
      throw new Error(
        `Missing required environment variables for ${env.SITE_ENV}:\n${missing.map((m) => `  - ${m}`).join('\n')}\nSee frontend/.env.example and docs/MANUAL_TASKS.md.`,
      )
    }
  }
  return env
}

export type ServerEnv = ReturnType<typeof getServerEnv>

/** True when a Sanity project is configured; otherwise the site reads local fixtures. */
export const isSanityConfigured = Boolean(publicEnv.NEXT_PUBLIC_SANITY_PROJECT_ID)

/** Canonical origin without a trailing slash, e.g. https://www.iimtechnicalservices.com */
export const siteUrl = publicEnv.NEXT_PUBLIC_SITE_URL.replace(/\/+$/, '')
