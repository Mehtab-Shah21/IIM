import AxeBuilder from '@axe-core/playwright'
import {expect, test} from '@playwright/test'

import {templates} from './helpers'

/** WCAG 2.2 AA (CLAUDE.md §15): no serious or critical axe violations on any template. */
for (const path of templates) {
  test(`axe: ${path}`, async ({page}) => {
    await page.goto(path)
    await page.evaluate(() =>
      document.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('is-visible')),
    )
    const results = await new AxeBuilder({page})
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze()
    const serious = results.violations.filter(
      (v) => v.impact === 'serious' || v.impact === 'critical',
    )
    expect(
      serious.map(
        (v) =>
          `${v.id}: ${v.help} (${v.nodes.length}) ${v.nodes
            .slice(0, 2)
            .map((n) => n.target.join(' '))
            .join(' | ')}`,
      ),
    ).toEqual([])
  })
}

/** The same checks in the dark theme, on the templates with the most light-surface content. */
for (const path of ['/', '/services/plumbing-services-dubai/', '/contact/', '/faq/', '/about/']) {
  test(`axe (dark theme): ${path}`, async ({page}) => {
    await page.addInitScript(() => localStorage.setItem('iim-theme', 'dark'))
    await page.goto(path)
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
    await page.evaluate(() =>
      document
        .querySelectorAll('[data-reveal], [data-words]')
        .forEach((el) => el.classList.add('is-visible')),
    )
    const results = await new AxeBuilder({page})
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze()
    const serious = results.violations.filter(
      (v) => v.impact === 'serious' || v.impact === 'critical',
    )
    expect(
      serious.map(
        (v) =>
          `${v.id}: ${v.help} (${v.nodes.length}) ${v.nodes
            .slice(0, 2)
            .map((n) => n.target.join(' '))
            .join(' | ')}`,
      ),
    ).toEqual([])
  })
}

test('theme toggle switches to dark and remembers it', async ({page}) => {
  await page.goto('/')
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  await page.getByRole('button', {name: 'Dark theme'}).click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await expect(page.getByRole('button', {name: 'Dark theme'})).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
})

test('tap targets are at least 44px', async ({page}) => {
  await page.setViewportSize({width: 390, height: 844})
  await page.goto('/')
  const small = await page.evaluate(() =>
    [...document.querySelectorAll<HTMLElement>('a, button, input, select, textarea, summary')]
      .filter((el) => {
        if (
          el.closest('p, li p, .prose-iim, dialog:not([open]), .hp-field, .skip-link, .mega-panel')
        )
          return false
        const r = el.getBoundingClientRect()
        if (r.width === 0 || r.height === 0) return false
        if (
          el instanceof HTMLInputElement &&
          (el.type === 'checkbox' || el.type === 'radio' || el.type === 'hidden')
        )
          return false
        return r.height < 44 && r.width < 44
      })
      .map((el) => `${el.tagName.toLowerCase()} "${el.textContent?.trim().slice(0, 30)}"`),
  )
  expect(small).toEqual([])
})
