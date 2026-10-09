#!/usr/bin/env node
/**
 * Performance budgets (CLAUDE.md §13, amended by the owner on 9 Oct 2026):
 * - First-load JavaScript per page ≤ framework baseline + 30 KB gzipped. The baseline is the
 *   JS shared by every page (Next.js + React runtime), measured from the build itself.
 * - Total CSS ≤ 40 KB gzipped.
 * - Home page HTML + CSS + JS + fonts ≤ 800 KB transferred (images are budgeted in Lighthouse CI).
 * Run after `next build`. Writes a report to .next/budget-report.json.
 */
import {readdirSync, readFileSync, statSync, writeFileSync} from 'node:fs'
import {join} from 'node:path'
import {gzipSync} from 'node:zlib'

const root = join(import.meta.dirname, '..')
const nextDir = join(root, '.next')
const appDir = join(nextDir, 'server', 'app')
const KB = 1024
const LIMITS = {pageJsOverBaselineKb: 30, cssGzKb: 40, homeTransferKb: 800}

const walk = (d) =>
  readdirSync(d, {withFileTypes: true}).flatMap((e) =>
    e.isDirectory() ? walk(join(d, e.name)) : [join(d, e.name)],
  )
const gz = (file) => gzipSync(readFileSync(file)).length
const assets = (html, ext) => [
  ...new Set(
    [...html.matchAll(new RegExp(`/_next/(static/[^"'\\s]+\\.${ext})`, 'g'))].map((m) => m[1]),
  ),
]
/** Scripts with the noModule attribute are legacy-browser polyfills that modern browsers never download. */
const noModule = (html) =>
  new Set(
    [...html.matchAll(/<script[^>]*src="\/_next\/(static\/[^"]+\.js)"[^>]*noModule[^>]*>/gi)].map(
      (m) => m[1],
    ),
  )

const pages = walk(appDir)
  .filter((f) => f.endsWith('.html'))
  .map((file) => {
    const html = readFileSync(file, 'utf8')
    const legacy = noModule(html)
    const js = assets(html, 'js').filter((c) => !legacy.has(c))
    const css = assets(html, 'css')
    const fonts = assets(html, 'woff2')
    return {
      route:
        file
          .slice(appDir.length)
          .replace(/\\/g, '/')
          .replace(/\.html$/, '') || '/',
      js,
      jsGz: js.reduce((s, c) => s + gz(join(nextDir, c)), 0),
      cssGz: css.reduce((s, c) => s + gz(join(nextDir, c)), 0),
      fontBytes: fonts.reduce((s, c) => s + statSync(join(nextDir, c)).size, 0),
      htmlGz: gzipSync(Buffer.from(html)).length,
    }
  })

if (!pages.length) {
  console.error('No prerendered pages found. Run `next build` first.')
  process.exit(1)
}

// Baseline: chunks present on every page.
const shared = pages
  .map((p) => new Set(p.js))
  .reduce((a, b) => new Set([...a].filter((x) => b.has(x))))
const baseline = [...shared].reduce((s, c) => s + gz(join(nextDir, c)), 0)

const failures = []
const rows = pages
  .sort((a, b) => a.route.localeCompare(b.route))
  .map((p) => {
    const over = (p.jsGz - baseline) / KB
    if (over > LIMITS.pageJsOverBaselineKb)
      failures.push(
        `${p.route}: ${over.toFixed(1)} KB JS above baseline (limit ${LIMITS.pageJsOverBaselineKb})`,
      )
    if (p.cssGz / KB > LIMITS.cssGzKb)
      failures.push(
        `${p.route}: CSS ${(p.cssGz / KB).toFixed(1)} KB gzipped (limit ${LIMITS.cssGzKb})`,
      )
    return {
      route: p.route,
      jsGzKb: +(p.jsGz / KB).toFixed(1),
      aboveBaselineKb: +over.toFixed(1),
      cssGzKb: +(p.cssGz / KB).toFixed(1),
    }
  })

const home = pages.find((p) => p.route === '/index' || p.route === '/')
if (home) {
  const total = (home.htmlGz + home.jsGz + home.cssGz + home.fontBytes) / KB
  if (total > LIMITS.homeTransferKb)
    failures.push(`home page: ${total.toFixed(0)} KB transferred (limit ${LIMITS.homeTransferKb})`)
  console.info(`Home page transfer (HTML + CSS + JS + fonts, gzipped): ${total.toFixed(0)} KB`)
}

console.info(`Framework baseline (shared by every page): ${(baseline / KB).toFixed(1)} KB gzipped`)
console.table(rows)
writeFileSync(
  join(nextDir, 'budget-report.json'),
  JSON.stringify({baselineKb: +(baseline / KB).toFixed(1), limits: LIMITS, pages: rows}, null, 2),
)

if (failures.length) {
  console.error(`Budget exceeded:\n  ${failures.join('\n  ')}`)
  process.exit(1)
}
console.info('All performance budgets met.')
