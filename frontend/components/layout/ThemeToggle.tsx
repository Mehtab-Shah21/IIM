'use client'

/**
 * Light/dark theme switch. The sun-to-moon morph is driven purely by CSS from the
 * `data-theme` attribute on <html> (set before first paint by the script in app/layout.tsx),
 * so the icon is right even before hydration. The choice is remembered in localStorage;
 * without one, the site follows the system setting.
 *
 * Effect adapted from Skiper UI "Theme Toggle Animations" (skiper-ui.com, after toggles.dev
 * by Alfie Jones), rebuilt with CSS transitions instead of Framer Motion.
 */
import {useId, useSyncExternalStore} from 'react'

export const THEME_KEY = 'iim-theme'

const subscribe = (onChange: () => void) => {
  const observer = new MutationObserver(onChange)
  observer.observe(document.documentElement, {attributes: true, attributeFilter: ['data-theme']})
  return () => observer.disconnect()
}
const isDarkNow = () => document.documentElement.dataset.theme === 'dark'

export function ThemeToggle() {
  const clipId = useId()
  const dark = useSyncExternalStore(subscribe, isDarkNow, () => null)

  const toggle = () => {
    const next = isDarkNow() ? 'light' : 'dark'
    document.documentElement.dataset.theme = next
    try {
      localStorage.setItem(THEME_KEY, next)
    } catch {
      // Private mode or blocked storage: the switch still works for this page view.
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Dark theme"
      aria-pressed={dark ?? undefined}
      className="theme-toggle inline-flex size-tap shrink-0 items-center justify-center rounded-pill border border-ink-700 text-cream transition hover:border-accent hover:text-accent"
    >
      <svg viewBox="0 0 32 32" className="size-icon" aria-hidden="true" fill="currentColor">
        <clipPath id={clipId}>
          <path className="tt-clip" d="M0-5h30a1 1 0 0 0 9 13v24H0Z" />
        </clipPath>
        <g clipPath={`url(#${clipId})`}>
          <circle className="tt-sun" cx="16" cy="16" r="8" />
          <g className="tt-rays" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M16 5.5v-4" />
            <path d="M16 30.5v-4" />
            <path d="M1.5 16h4" />
            <path d="M26.5 16h4" />
            <path d="m23.4 8.6 2.8-2.8" />
            <path d="m5.7 26.3 2.9-2.9" />
            <path d="m5.8 5.8 2.8 2.8" />
            <path d="m23.4 23.4 2.9 2.9" />
          </g>
        </g>
      </svg>
    </button>
  )
}
