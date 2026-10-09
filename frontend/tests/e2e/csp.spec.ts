import {expect, test} from '@playwright/test'

import {buildCsp} from '../../lib/security/headers'

/**
 * ADR-003 evidence: serve the real pages under an ENFORCED CSP and check that the site
 * hydrates (interactive menu) and that no violations fire.
 * - Variant A, strict: script-src without 'unsafe-inline' (SRI only).
 * - Variant B, the shipped policy: 'unsafe-inline' allowed for scripts, everything else strict.
 */
const pages = ['/', '/services/plumbing-services-dubai/', '/get-a-quote/']

for (const variant of [
  {name: 'strict (SRI only)', allowInlineScripts: false},
  {name: 'shipped policy', allowInlineScripts: true},
]) {
  test.describe(`enforced CSP: ${variant.name}`, () => {
    test.use({viewport: {width: 390, height: 844}})

    for (const path of pages) {
      test(path, async ({page}) => {
        const csp = buildCsp({
          studioUrl: 'https://iim.sanity.studio',
          allowInlineScripts: variant.allowInlineScripts,
          isDev: false,
        }).replace('; upgrade-insecure-requests', '')
        await page.route('**/*', async (route) => {
          const res = await route.fetch()
          const headers: Record<string, string> = {...res.headers(), 'content-security-policy': csp}
          delete headers['content-security-policy-report-only']
          await route.fulfill({response: res, headers})
        })
        const violations: string[] = []
        page.on('console', (m) => {
          if (m.type() === 'error' && /Content Security Policy/i.test(m.text()))
            violations.push(m.text().slice(0, 160))
        })
        await page.goto(path)
        await page.getByRole('button', {name: 'Open menu'}).click()
        const hydrated = await page
          .getByRole('dialog', {name: 'Menu'})
          .isVisible({timeout: 3000})
          .catch(() => false)

        // Stop intercepting before the test ends (lazy images may still be loading).
        await page.unrouteAll({behavior: 'ignoreErrors'})

        if (variant.allowInlineScripts) {
          expect(violations).toEqual([])
          expect(hydrated).toBe(true)
        } else {
          // Record the outcome for ADR-003 rather than failing the build.
          test.info().annotations.push({
            type: 'csp-strict',
            description: `hydrated=${hydrated}, violations=${violations.length}`,
          })
        }
      })
    }
  })
}
