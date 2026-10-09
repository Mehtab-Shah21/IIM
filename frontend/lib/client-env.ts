'use client'

/**
 * Small client-only facts read without setState-in-effect: whether the component has hydrated
 * (false in server HTML, true in the browser) and the reduced-motion preference (assumed on
 * the server, so nothing animates before JavaScript knows).
 */
import {useSyncExternalStore} from 'react'

const noop = () => () => {}

export function useHydrated(): boolean {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false,
  )
}

const REDUCED = '(prefers-reduced-motion: reduce)'

export function useReducedMotion(): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(REDUCED)
      mq.addEventListener('change', onChange)
      return () => mq.removeEventListener('change', onChange)
    },
    () => window.matchMedia(REDUCED).matches,
    () => true,
  )
}
