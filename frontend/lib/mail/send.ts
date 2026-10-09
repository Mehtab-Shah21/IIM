/**
 * Email adapter (CLAUDE.md §4): nodemailer over SMTP behind sendEmail(), so another provider
 * (e.g. Resend) can replace it in one place. Without SMTP settings (local/CI) messages go to a
 * JSON transport and are not sent.
 */
import nodemailer, {type Transporter} from 'nodemailer'

import {getServerEnv} from '@/lib/env'

export type Email = {to: string | string[]; subject: string; text: string; replyTo?: string}

let transporter: Transporter | null = null

function getTransport(): Transporter {
  if (transporter) return transporter
  const env = getServerEnv()
  transporter = env.SMTP_HOST
    ? nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        secure: env.SMTP_PORT === 465,
        auth: env.SMTP_USER ? {user: env.SMTP_USER, pass: env.SMTP_PASS} : undefined,
      })
    : nodemailer.createTransport({jsonTransport: true})
  return transporter
}

export async function sendEmail(email: Email): Promise<boolean> {
  try {
    const env = getServerEnv()
    await getTransport().sendMail({from: env.MAIL_FROM, ...email})
    return true
  } catch (err) {
    console.error(JSON.stringify({event: 'mail_failed', error: err instanceof Error ? err.message : 'unknown'}))
    return false
  }
}
