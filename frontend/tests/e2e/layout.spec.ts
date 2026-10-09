import {expect, test} from '@playwright/test'

import {templates, widths} from './helpers'

/**
 * Layout checks at every required width (CLAUDE.md §17): no horizontal scroll, no element wider
 * than the viewport, equal card heights within a row, one H1. A full-page screenshot of every
 * template at every width is attached to the report for visual review.
 */
for (const width of widths) {
  test.describe(`${width}px`, () => {
    test.use({viewport: {width, height: 900}})

    for (const path of templates) {
      test(`${path}`, async ({page}, info) => {
        await page.goto(path)
        await page.evaluate(() =>
          document
            .querySelectorAll('[data-reveal]')
            .forEach((el) => el.classList.add('is-visible')),
        )

        const overflow = await page.evaluate(() => {
          const vw = document.documentElement.clientWidth
          const offenders = [...document.querySelectorAll<HTMLElement>('body *')]
            .filter((el) => {
              if (
                el.closest(
                  'dialog:not([open]), .hp-field, .skip-link, .mega-panel, [aria-hidden="true"]',
                )
              )
                return false
              const r = el.getBoundingClientRect()
              return r.width > 0 && (r.right > vw + 1 || r.left < -1)
            })
            .slice(0, 5)
            .map((el) => `${el.tagName.toLowerCase()}.${[...el.classList].slice(0, 3).join('.')}`)
          return {scroll: document.documentElement.scrollWidth - window.innerWidth, offenders}
        })
        expect(overflow.scroll, `horizontal scroll at ${width}px`).toBeLessThanOrEqual(0)
        expect(overflow.offenders, `elements wider than the viewport at ${width}px`).toEqual([])

        // Cards in the same row have the same height.
        const rows = await page.evaluate(() => {
          const groups = new Map<string, number[]>()
          document.querySelectorAll<HTMLElement>('article.group').forEach((card) => {
            const r = card.getBoundingClientRect()
            const key = `${card.parentElement?.className}|${Math.round(r.top + window.scrollY)}`
            groups.set(key, [...(groups.get(key) ?? []), Math.round(r.height)])
          })
          return [...groups.values()].filter((h) => h.length > 1)
        })
        for (const heights of rows)
          expect(Math.max(...heights) - Math.min(...heights)).toBeLessThanOrEqual(1)

        await expect(page.locator('h1')).toHaveCount(1)

        if (process.env.SCREENSHOTS) {
          await info.attach(`${path.replace(/\W+/g, '_')}-${width}`, {
            body: await page.screenshot({fullPage: true}),
            contentType: 'image/png',
          })
        }
      })
    }
  })
}
