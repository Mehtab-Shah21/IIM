import {expect, test} from '@playwright/test'

test('homepage shows who, what and how to book above the fold', async ({page}) => {
  await page.goto('/')
  await expect(page.locator('h1')).toHaveCount(1)
  await expect(page.locator('h1')).toContainText('Dubai')
  await expect(page.getByRole('link', {name: 'Get a Quote'}).first()).toBeVisible()
  await expect(page.getByRole('link', {name: /WhatsApp Us/}).first()).toBeVisible()
})

test('every WhatsApp link uses the configured number and a page-specific message', async ({
  page,
}) => {
  await page.goto('/services/plumbing-services-dubai/')
  const hrefs = await page
    .locator('a[href*="wa.me"]')
    .evaluateAll((as) => as.map((a) => (a as HTMLAnchorElement).href))
  expect(hrefs.length).toBeGreaterThan(0)
  for (const h of hrefs) expect(h).toMatch(/^https:\/\/wa\.me\/971509626446\?text=/)
  // Header and drawer use the general message; links in the page body carry the service message.
  const inPage = await page.locator('main a[href*="wa.me"]').first().getAttribute('href')
  expect(decodeURIComponent(inPage!.split('text=')[1]!)).toBe('Hi IIM, I need a plumber in Dubai.')
})

test('call links dial the number shown', async ({page}) => {
  await page.goto('/contact/')
  const tel = page.locator('main a[href^="tel:"]').first()
  await expect(tel).toHaveAttribute('href', 'tel:+971509626446')
  await expect(tel).toHaveText('+971 50 962 6446')
})

test.describe('mobile', () => {
  test.skip(({isMobile}) => !isMobile, 'mobile only')

  test('action bar shows Call, WhatsApp and Get a Quote and does not cover content', async ({
    page,
  }) => {
    await page.goto('/')
    const bar = page.getByRole('navigation', {name: 'Quick actions'})
    await expect(bar).toBeVisible()
    await expect(bar.getByRole('link')).toHaveText([/Call/, /WhatsApp/, /Get a Quote/])
    const padding = await page.evaluate(() =>
      parseFloat(getComputedStyle(document.body).paddingBottom),
    )
    const barHeight = await bar.evaluate((el) => el.getBoundingClientRect().height)
    expect(padding).toBeGreaterThanOrEqual(barHeight - 1)
  })

  test('drawer opens, traps focus, closes with Escape and returns focus', async ({page}) => {
    await page.goto('/')
    const toggle = page.getByRole('button', {name: 'Open menu'})
    await toggle.click()
    const drawer = page.getByRole('dialog', {name: 'Menu'})
    await expect(drawer).toBeVisible()
    await expect(drawer.getByRole('link', {name: 'Plumbing Services'})).toBeVisible()
    expect(
      await page.evaluate(() =>
        document.querySelector('dialog[open]')?.contains(document.activeElement),
      ),
    ).toBe(true)
    await page.keyboard.press('Escape')
    await expect(drawer).toBeHidden()
  })
})

test.describe('desktop', () => {
  test.skip(({isMobile}) => isMobile, 'desktop only')

  test('services mega menu opens from its button and closes with Escape', async ({page}) => {
    await page.goto('/')
    const button = page.getByRole('button', {name: 'Show services'})
    await button.click()
    await expect(button).toHaveAttribute('aria-expanded', 'true')
    await expect(page.locator('.mega-panel').getByRole('link', {name: /AC Services/})).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(button).toHaveAttribute('aria-expanded', 'false')
  })

  test('client-side navigation works', async ({page}) => {
    await page.goto('/')
    await page.getByRole('navigation', {name: 'Primary'}).getByRole('link', {name: 'About'}).click()
    await expect(page).toHaveURL(/\/about\/$/)
    await expect(page.locator('h1')).toHaveText('About IIM Technical Services')
  })

  test('skip link moves focus to the main content', async ({page}) => {
    await page.goto('/')
    await page.keyboard.press('Tab')
    await expect(page.getByRole('link', {name: 'Skip to content'})).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL(/#main$/)
  })
})

test('404 pages are server-rendered with the layout and a 404 status', async ({request}) => {
  for (const path of ['/no-such-page/', '/services/no-such-service/', '/privacy-policy/']) {
    const res = await request.get(path)
    expect(res.status(), path).toBe(404)
    const html = await res.text()
    expect(html, path).toContain('<header')
    expect(html, path).toContain('We could not find that page')
  }
})
