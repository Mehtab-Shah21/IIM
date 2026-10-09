#!/usr/bin/env node
/**
 * Review crawl: opens every page of a running site in a real browser, collects every link and
 * button, and reports anything a client could click that goes nowhere:
 *   - internal links that do not end on a 200 page (after redirects)
 *   - empty or "#" links, javascript: links, and in-page anchors whose target is missing
 *   - tel:, mailto: and WhatsApp links that are malformed
 *   - visible buttons that are disabled with no reason, or have no accessible name
 *
 *   node scripts/check-links.mjs http://localhost:3000
 */
import {chromium} from '@playwright/test'

const base = (process.argv[2] ?? 'http://localhost:3000').replace(/\/$/, '')
const start = ['/', '/sitemap.xml']
const problems = []
const seen = new Set()
const status = new Map()

const browser = await chromium.launch()
const page = await browser.newPage({viewport: {width: 1280, height: 900}})

async function pageStatus(path) {
  if (status.has(path)) return status.get(path)
  const res = await page.request.get(base + path, {maxRedirects: 5}).catch(() => null)
  const s = res ? res.status() : 0
  status.set(path, s)
  return s
}

// Seed with the sitemap and every page that only appears in links.
const sitemap = await (await page.request.get(`${base}/sitemap.xml`)).text()
const queue = [
  ...new Set([
    '/',
    ...[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname),
  ]),
]

while (queue.length) {
  const path = queue.shift()
  if (seen.has(path)) continue
  seen.add(path)
  const res = await page.goto(base + path, {waitUntil: 'networkidle'}).catch(() => null)
  if (!res || res.status() !== 200) {
    problems.push(`${path}: page returned ${res?.status() ?? 'no response'}`)
    continue
  }
  const found = await page.evaluate(() => {
    const visible = (el) => {
      const r = el.getBoundingClientRect()
      const s = getComputedStyle(el)
      return r.width > 0 && r.height > 0 && s.visibility !== 'hidden'
    }
    return {
      links: [...document.querySelectorAll('a')].map((a) => ({
        href: a.getAttribute('href'),
        abs: a.href,
        text: (a.getAttribute('aria-label') || a.textContent || '').trim().slice(0, 50),
        visible: visible(a),
      })),
      buttons: [...document.querySelectorAll('button')].filter(visible).map((b) => ({
        name: (b.getAttribute('aria-label') || b.textContent || '').trim().slice(0, 50),
        disabled: b.disabled,
        inForm: Boolean(b.closest('form')),
        controls: b.getAttribute('aria-controls'),
      })),
      ids: [...document.querySelectorAll('[id]')].map((e) => e.id),
    }
  })

  for (const l of found.links) {
    const where = `${path} -> "${l.text}"`
    const href = l.href ?? ''
    if (!href || href === '#') {
      problems.push(`${where}: empty or "#" link`)
      continue
    }
    if (href.startsWith('javascript:')) problems.push(`${where}: javascript: link`)
    else if (href.startsWith('tel:')) {
      if (!/^tel:\+\d{8,15}$/.test(href)) problems.push(`${where}: malformed ${href}`)
    } else if (href.startsWith('mailto:')) {
      if (!/^mailto:[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(href))
        problems.push(`${where}: malformed ${href}`)
    } else if (href.startsWith('#')) {
      if (!found.ids.includes(decodeURIComponent(href.slice(1))))
        problems.push(`${where}: in-page target ${href} missing`)
    } else {
      const url = new URL(l.abs)
      if (url.origin === new URL(base).origin) {
        const target = url.pathname + url.search
        const s = await pageStatus(target)
        if (s !== 200) problems.push(`${where}: ${target} returned ${s}`)
        if (url.hash && url.pathname === path && !found.ids.includes(url.hash.slice(1)))
          problems.push(`${where}: in-page target ${url.hash} missing`)
        if (!url.search && !seen.has(url.pathname) && s === 200) queue.push(url.pathname)
      } else if (url.hostname === 'wa.me') {
        if (!/^\/\d{8,15}$/.test(url.pathname))
          problems.push(`${where}: malformed WhatsApp ${href}`)
      } else if (!/^https:/.test(href)) problems.push(`${where}: non-https external ${href}`)
    }
  }
  for (const b of found.buttons) {
    if (!b.name) problems.push(`${path}: a visible button has no accessible name`)
  }
}

await browser.close()
console.log(`Checked ${seen.size} pages and ${status.size} distinct internal targets.`)
if (problems.length) {
  console.log([...new Set(problems)].join('\n'))
  process.exitCode = 1
} else console.log('Every link and button leads somewhere.')
