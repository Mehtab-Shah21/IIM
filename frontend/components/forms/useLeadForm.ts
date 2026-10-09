'use client'

import {useRouter} from 'next/navigation'
import {useEffect, useRef, useState} from 'react'

import {track} from '@/lib/analytics/track'

export type Errors = Record<string, string>

/**
 * Shared submit logic: validates with the shared Zod schema (loaded on demand), posts as
 * application/x-www-form-urlencoded to /api/quote, shows field errors, prevents double submit.
 */
export function useLeadForm(type: 'quote' | 'amc', initialErrors: Errors = {}) {
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const [errors, setErrors] = useState<Errors>(initialErrors)
  const [message, setMessage] = useState<string | null>(null)
  const [fallbackRef, setFallbackRef] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [resetSignal, setResetSignal] = useState(0)

  // Real start time for the minimum-fill check (the server-rendered value is the build time).
  useEffect(() => {
    const el = formRef.current?.elements.namedItem('startedAt') as HTMLInputElement | null
    if (el) el.value = String(Date.now())
    const params = new URLSearchParams(window.location.search)
    for (const k of ['utm_source', 'utm_medium', 'utm_campaign']) {
      const input = formRef.current?.elements.namedItem(
        k.replace(/_(\w)/, (_, c: string) => c.toUpperCase()),
      ) as HTMLInputElement | null
      if (input && params.get(k)) input.value = params.get(k)!.slice(0, 100)
    }
    const page = formRef.current?.elements.namedItem('pageUrl') as HTMLInputElement | null
    if (page) page.value = window.location.href.split('#')[0]!.slice(0, 500)
  }, [])

  const values = () =>
    Object.fromEntries(new FormData(formRef.current!).entries()) as Record<string, string>

  /** Validates only the given fields (a step). Returns true when they are valid. */
  async function validate(
    fields: readonly string[] | null,
    serviceSlugs: string[] = [],
  ): Promise<boolean> {
    const {amcSchema, quoteSchema, fieldErrors} = await import('@/lib/forms/schema')
    const schema = type === 'amc' ? amcSchema : quoteSchema(serviceSlugs)
    const result = schema.safeParse({...values(), type})
    const all = result.success ? {} : fieldErrors(result.error)
    const relevant = fields
      ? Object.fromEntries(Object.entries(all).filter(([k]) => fields.includes(k)))
      : all
    setErrors((prev) => {
      const next = {...prev}
      for (const f of fields ?? Object.keys(prev)) delete next[f]
      return {...next, ...relevant}
    })
    const first = Object.keys(relevant)[0]
    if (first) focusField(formRef.current, first)
    return Object.keys(relevant).length === 0
  }

  async function submit(e: React.FormEvent, serviceSlugs: string[] = []): Promise<Errors | null> {
    e.preventDefault()
    if (submitting) return null
    setMessage(null)
    if (!(await validate(null, serviceSlugs))) return errors
    setSubmitting(true)
    try {
      const res = await fetch('/api/quote', {
        method: 'POST',
        headers: {Accept: 'application/json', 'Content-Type': 'application/x-www-form-urlencoded'},
        body: new URLSearchParams(values()),
      })
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean
        ref?: string
        redirect?: string
        message?: string
        errors?: Errors
      }
      if (res.ok && data.ok && data.redirect) {
        track(type === 'amc' ? 'amc_submit' : 'quote_submit', {
          form_location: window.location.pathname,
        })
        router.push(data.redirect)
        return null
      }
      if (data.errors) {
        setErrors(data.errors)
        const first = Object.keys(data.errors)[0]
        if (first) focusField(formRef.current, first)
      }
      if (data.ref) setFallbackRef(data.ref)
      setMessage(
        data.message ?? 'Something went wrong. Please try again, or message us on WhatsApp.',
      )
      setResetSignal((n) => n + 1)
      return data.errors ?? null
    } catch {
      setMessage(
        'We could not send your request. Check your connection and try again, or message us on WhatsApp.',
      )
      return null
    } finally {
      setSubmitting(false)
    }
  }

  return {
    formRef,
    errors,
    setErrors,
    message,
    fallbackRef,
    submitting,
    submit,
    validate,
    resetSignal,
  }
}

export function focusField(form: HTMLFormElement | null, name: string) {
  const el = form?.querySelector<HTMLElement>(`[name="${CSS.escape(name)}"]`)
  el?.focus()
}
