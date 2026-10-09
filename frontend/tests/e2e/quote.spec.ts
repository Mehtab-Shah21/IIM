import {expect, test} from '@playwright/test'

import {ipHeader, postLead, quoteBody, tomorrow} from './helpers'

const WEBHOOK = 'http://localhost:4010'

test.describe('quote form in the browser', () => {
  test.beforeEach(async ({page}) => {
    await page.setExtraHTTPHeaders(ipHeader())
  })

  test('valid request: three steps, thank-you page with reference, signed webhook received', async ({
    page,
    request,
  }) => {
    await page.goto('/get-a-quote/?need=plumbing-services-dubai')
    await expect(page.getByRole('radio', {name: 'Plumbing Services'})).toBeChecked()

    // Step 1: the Continue button validates first.
    await page.getByRole('button', {name: 'Continue'}).click()
    await expect(page.getByText('Please enter at least 10 characters.')).toBeVisible()
    await page
      .getByLabel('Describe the job')
      .fill('Kitchen sink leaking under the cabinet (E2E TEST)')
    await page.getByRole('button', {name: 'Continue'}).click()

    // Step 2
    await expect(page.getByText('2. Where and when?')).toBeVisible()
    await page.getByLabel('Area or community').fill('Dubai Marina')
    await page.getByLabel('Preferred date').fill(tomorrow())
    await page.getByRole('button', {name: 'Continue'}).click()

    // Step 3
    await page.getByLabel('Full name').fill('E2E Tester')
    await page.getByLabel('Mobile number').fill('050 123 4567')
    await page.getByRole('button', {name: 'Send my request'}).click()
    await expect(
      page.getByText('Please agree so we can contact you about this request.'),
    ).toBeVisible()
    await page.getByLabel(/I agree that IIM Technical Services/).check()

    await page.waitForTimeout(3100) // the minimum fill time
    await page.getByRole('button', {name: 'Send my request'}).click()
    await expect(page).toHaveURL(/\/thank-you\/\?ref=IIM-\d{6}-[0-9A-Z]{4}/)
    const ref = new URL(page.url()).searchParams.get('ref')!
    await expect(page.getByText(`Your reference number is ${ref}.`)).toBeVisible()
    await expect(page.getByRole('link', {name: 'Send photos on WhatsApp'})).toHaveAttribute(
      'href',
      new RegExp(encodeURIComponent(ref)),
    )

    const received = await request.get(`${WEBHOOK}/received/${ref}`)
    expect(received.status()).toBe(200)
    const {lead} = (await received.json()) as {lead: Record<string, unknown>}
    expect(lead).toMatchObject({
      ref,
      type: 'quote',
      service: 'plumbing-services-dubai',
      phone: '+971501234567',
      emirate: 'Dubai',
      area: 'Dubai Marina',
    })
  })

  test('works without JavaScript: one long form, 303 to the thank-you page', async ({browser}) => {
    const context = await browser.newContext({
      javaScriptEnabled: false,
      extraHTTPHeaders: ipHeader(),
    })
    const page = await context.newPage()
    await page.goto('/get-a-quote/')
    await expect(page.getByText('3. Your details')).toBeVisible() // every step visible
    await page.getByRole('radio', {name: 'Electrical Services'}).check({force: true})
    await page
      .getByLabel('Describe the job')
      .fill('Breaker keeps tripping in the kitchen (E2E TEST)')
    await page.getByLabel('Area or community').fill('Al Barsha')
    await page.getByLabel('Preferred date').fill(tomorrow())
    await page.getByLabel('Full name').fill('No JS Tester')
    await page.getByLabel('Mobile number').fill('055 123 4567')
    await page.getByLabel(/I agree that IIM Technical Services/).check()
    await page.locator('.nojs-submit button').click()
    await expect(page).toHaveURL(/\/thank-you\/\?ref=IIM-/)
    await context.close()
  })

  test('annual contract application from the homepage', async ({page}) => {
    await page.goto('/')
    const form = page.locator('#annual-contract form')
    await form.getByLabel('Full name').fill('AMC Tester')
    await form.getByLabel('Mobile number').fill('+971 52 123 4567')
    await form.getByLabel('Area or building').fill('Jumeirah Lake Towers')
    await form.getByLabel('Property type').selectOption('villa')
    await form.getByLabel(/I agree to be contacted/).check()
    await page.waitForTimeout(3100)
    await form.getByRole('button', {name: 'Apply for a contract'}).click()
    await expect(page).toHaveURL(/\/thank-you\/\?ref=IIM-.*type=amc/)
  })
})

test.describe('lead API', () => {
  test('a failed webhook still reaches the owner by email (no lead lost)', async ({request}) => {
    const res = await postLead(request, quoteBody({name: 'FAILWEBHOOK Tester'}))
    expect(res.status()).toBe(200)
    const body = (await res.json()) as {ok: boolean; ref: string}
    expect(body.ok).toBe(true)
    const received = await request.get(`${WEBHOOK}/received/${body.ref}`)
    expect(received.status()).toBe(404)
    expect(((await received.json()) as {attempts: number}).attempts).toBe(3) // retried 3 times
  })

  test('invalid input returns field errors', async ({request}) => {
    const res = await postLead(request, quoteBody({phone: '12345', preferredDate: '2020-01-01'}))
    expect(res.status()).toBe(400)
    const body = (await res.json()) as {errors: Record<string, string>}
    expect(Object.keys(body.errors).sort()).toEqual(['phone', 'preferredDate'])
  })

  test('honeypot gets a fake success and delivers nothing', async ({request}) => {
    const res = await postLead(request, quoteBody({website: 'http://spam.example'}))
    expect(res.status()).toBe(200)
    const {ref} = (await res.json()) as {ref: string}
    expect((await request.get(`${WEBHOOK}/received/${ref}`)).status()).toBe(404)
  })

  test('submissions faster than 3 seconds are rejected', async ({request}) => {
    const res = await postLead(request, quoteBody({startedAt: String(Date.now())}))
    expect(res.status()).toBe(403)
  })

  test('requests from another origin are rejected', async ({request}) => {
    const res = await postLead(request, quoteBody(), {Origin: 'https://evil.example'})
    expect(res.status()).toBe(403)
  })

  test('rate limit: the sixth request in an hour from one IP gets 429', async ({request}) => {
    const ip = ipHeader()
    const statuses: number[] = []
    for (let i = 0; i < 6; i++)
      statuses.push((await postLead(request, quoteBody({description: 'short'}), ip)).status())
    expect(statuses.slice(0, 5).every((s) => s === 400)).toBe(true)
    expect(statuses[5]).toBe(429)
  })

  test('no-JavaScript validation errors redirect back without personal data in the URL', async ({
    request,
  }) => {
    const res = await request.post('/api/quote/', {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Origin: 'http://localhost:3100',
        ...ipHeader(),
      },
      data: quoteBody({phone: '123', name: 'Private Name'}),
      maxRedirects: 0,
    })
    expect(res.status()).toBe(303)
    const location = res.headers().location!
    expect(location).toContain('/get-a-quote/?type=quote&errors=phone')
    expect(location).not.toContain('Private')
    expect(location).not.toContain('123')
  })

  test('the endpoint is never cached', async ({request}) => {
    const res = await postLead(request, quoteBody({description: 'short'}))
    expect(res.headers()['cache-control']).toContain('no-store')
  })
})
