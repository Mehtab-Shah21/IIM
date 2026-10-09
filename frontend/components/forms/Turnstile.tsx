'use client'

/**
 * Cloudflare Turnstile, loaded lazily the first time the visitor interacts with the form
 * (keeps third-party JS off the initial page load). Writes the token to a hidden input.
 */
import {useEffect, useRef} from 'react'

type TurnstileApi = {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string
  reset: (id?: string) => void
}

declare global {
  interface Window {
    turnstile?: TurnstileApi
    __iimTurnstile?: Promise<void>
  }
}

function loadScript(): Promise<void> {
  if (window.__iimTurnstile) return window.__iimTurnstile
  window.__iimTurnstile = new Promise<void>((resolve, reject) => {
    const s = document.createElement('script')
    s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
    s.async = true
    s.onload = () => resolve()
    s.onerror = () => reject(new Error('turnstile'))
    document.head.appendChild(s)
  })
  return window.__iimTurnstile
}

export function Turnstile({siteKey, formRef, resetSignal}: {siteKey?: string; formRef: React.RefObject<HTMLFormElement | null>; resetSignal: number}) {
  const box = useRef<HTMLDivElement>(null)
  const widgetId = useRef<string | null>(null)

  useEffect(() => {
    const form = formRef.current
    if (!siteKey || !form) return
    const start = () => {
      loadScript()
        .then(() => {
          if (!box.current || widgetId.current || !window.turnstile) return
          widgetId.current = window.turnstile.render(box.current, {
            sitekey: siteKey,
            'response-field-name': 'turnstileToken',
            size: 'flexible',
            appearance: 'interaction-only',
          })
        })
        .catch(() => undefined)
    }
    form.addEventListener('focusin', start, {once: true})
    form.addEventListener('pointerdown', start, {once: true})
    return () => {
      form.removeEventListener('focusin', start)
      form.removeEventListener('pointerdown', start)
    }
  }, [siteKey, formRef])

  useEffect(() => {
    if (resetSignal && widgetId.current && window.turnstile) window.turnstile.reset(widgetId.current)
  }, [resetSignal])

  if (!siteKey) return null
  return <div ref={box} className="turnstile-box" aria-label="Spam check" />
}
