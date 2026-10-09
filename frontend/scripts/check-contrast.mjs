#!/usr/bin/env node
/**
 * WCAG 2.2 AA contrast check for every text/background pair the design system allows
 * (CLAUDE.md §7, ADR-002). Colours are read from styles/tokens.css, so a token change that
 * breaks contrast fails CI.
 */
import {readFileSync} from 'node:fs'
import {join} from 'node:path'

const css = readFileSync(join(import.meta.dirname, '..', 'styles', 'tokens.css'), 'utf8')
const token = (name) => {
  const m = css.match(new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6})`))
  if (!m) throw new Error(`Token --${name} not found or not a 6-digit hex colour`)
  return m[1]
}

const lum = (hex) => {
  const [r, g, b] = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p)
  return (x + 0.05) / (y + 0.05)
}

/** [text, background, minimum] — 4.5 for body text, 3 for large text and UI graphics. */
const pairs = [
  ['ink-900', 'white', 4.5],
  ['ink-900', 'neutral-50', 4.5],
  ['ink-900', 'neutral-100', 4.5],
  ['ink-900', 'cream', 4.5],
  ['ink-900', 'accent', 4.5],
  ['ink-900', 'accent-600', 4.5],
  ['ink-900', 'gold', 4.5],
  ['ink-900', 'whatsapp', 4.5],
  ['ink-900', 'whatsapp-600', 4.5],
  ['neutral-600', 'white', 4.5],
  ['neutral-600', 'neutral-50', 4.5],
  ['navy', 'white', 4.5],
  ['navy', 'neutral-50', 4.5],
  ['navy', 'cream', 4.5],
  ['cream', 'ink-900', 4.5],
  ['cream', 'ink-950', 4.5],
  ['cream', 'ink-800', 4.5],
  ['cream-muted', 'ink-900', 4.5],
  ['cream-muted', 'ink-950', 4.5],
  ['cream-muted', 'ink-800', 4.5],
  ['accent', 'ink-900', 4.5],
  ['accent', 'ink-800', 4.5],
  ['accent', 'ink-950', 4.5],
  ['gold', 'ink-900', 4.5],
  ['success', 'white', 4.5],
  ['success', 'success-bg', 4.5],
  ['error', 'white', 4.5],
  ['error', 'error-bg', 4.5],
  ['neutral-600', 'white', 3], // form control borders (UI graphics)
  ['accent', 'white', 1], // listed to document it: amber is never text on white (1.7:1)
  // Dark theme (ADR-006): light surfaces re-pointed to these tokens.
  ['dark-text', 'dark-surface', 4.5],
  ['dark-text', 'dark-raised', 4.5],
  ['dark-text', 'dark-raised-2', 4.5],
  ['dark-text-muted', 'dark-surface', 4.5],
  ['dark-text-muted', 'dark-raised', 4.5],
  ['dark-text-muted', 'dark-raised-2', 4.5],
  ['dark-link', 'dark-surface', 4.5],
  ['dark-link', 'dark-raised', 4.5],
  ['dark-success', 'dark-surface', 4.5],
  ['dark-success', 'dark-success-bg', 4.5],
  ['dark-error', 'dark-surface', 4.5],
  ['dark-error', 'dark-error-bg', 4.5],
  ['dark-text-muted', 'dark-surface', 3], // form control borders in dark mode
]

let failed = 0
for (const [fg, bg, min] of pairs) {
  const r = ratio(token(fg), token(bg))
  const ok = r >= min
  if (!ok) failed++
  if (min > 1)
    console.info(
      `${ok ? 'pass' : 'FAIL'}  ${r.toFixed(2).padStart(5)}  ${fg} on ${bg} (min ${min})`,
    )
}
if (failed) {
  console.error(`${failed} contrast pair(s) below WCAG 2.2 AA.`)
  process.exit(1)
}
console.info('All text/background pairs meet WCAG 2.2 AA.')
