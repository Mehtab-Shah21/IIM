import {describe, expect, it} from 'vitest'

import {addDays, amcSchema, dubaiToday, normaliseUaePhone, quoteSchema} from '@/lib/forms/schema'

describe('normaliseUaePhone', () => {
  it.each([
    ['050 123 4567', '+971501234567'],
    ['0501234567', '+971501234567'],
    ['+971 50 123 4567', '+971501234567'],
    ['00971501234567', '+971501234567'],
    ['971-55-123-4567', '+971551234567'],
    ['(056) 123 4567', '+971561234567'],
    ['04 123 4567', '+97141234567'],
    ['+97142345678', '+97142345678'],
  ])('%s -> %s', (raw, e164) => expect(normaliseUaePhone(raw)).toBe(e164))

  it.each(['051 123 4567', '12345', '+44 20 7946 0958', '050 123 456', '050 123 45678', ''])(
    'rejects %s',
    (raw) => expect(normaliseUaePhone(raw)).toBeNull(),
  )
})

describe('dates', () => {
  it('uses Dubai time (UTC+4) for today', () => {
    expect(dubaiToday(new Date('2026-10-09T21:30:00Z'))).toBe('2026-10-10')
    expect(dubaiToday(new Date('2026-10-09T10:00:00Z'))).toBe('2026-10-09')
  })
  it('adds days across months', () => expect(addDays('2026-10-30', 3)).toBe('2026-11-02'))
})

const now = new Date('2026-10-09T08:00:00Z')
const valid = {
  type: 'quote',
  service: 'plumbing-services-dubai',
  description: 'Kitchen sink leaking under the cabinet',
  emirate: 'Dubai',
  area: 'Dubai Marina',
  address: '',
  preferredDate: '2026-10-11',
  preferredTime: 'morning',
  name: 'Test Person',
  phone: '050 123 4567',
  email: '',
  consent: 'on',
}

describe('quoteSchema', () => {
  const schema = quoteSchema(['plumbing-services-dubai', 'electrical-services-dubai'], now)

  it('accepts a valid lead and normalises the phone', () => {
    const r = schema.safeParse(valid)
    expect(r.success).toBe(true)
    if (r.success) {
      expect(r.data.phone).toBe('+971501234567')
      expect(r.data.consent).toBe(true)
      expect(r.data.email).toBeUndefined()
    }
  })

  it.each([
    ['service', {service: 'not-a-service'}],
    ['description', {description: 'short'}],
    ['emirate', {emirate: 'London'}],
    ['area', {area: 'x'}],
    ['preferredDate', {preferredDate: '2026-10-08'}],
    ['preferredDate', {preferredDate: '2026-12-25'}],
    ['preferredTime', {preferredTime: 'midnight'}],
    ['name', {name: 'A'}],
    ['phone', {phone: '12345'}],
    ['email', {email: 'not-an-email'}],
    ['consent', {consent: undefined}],
  ])('rejects bad %s', (field, patch) => {
    const r = schema.safeParse({...valid, ...patch})
    expect(r.success).toBe(false)
    if (!r.success) expect(r.error.issues.map((i) => i.path[0])).toContain(field)
  })

  it('accepts "other" as a service and an optional email', () => {
    expect(schema.safeParse({...valid, service: 'other', email: 'a@b.ae'}).success).toBe(true)
  })

  it('allows dates up to 60 days ahead', () => {
    expect(schema.safeParse({...valid, preferredDate: addDays(dubaiToday(now), 60)}).success).toBe(
      true,
    )
    expect(schema.safeParse({...valid, preferredDate: addDays(dubaiToday(now), 61)}).success).toBe(
      false,
    )
  })
})

describe('amcSchema', () => {
  const amc = {
    type: 'amc',
    name: 'Test Person',
    phone: '+971 55 123 4567',
    emirate: 'Sharjah',
    area: 'Al Nahda',
    propertyType: 'villa',
    consent: 'on',
  }
  it('accepts a valid application', () => expect(amcSchema.safeParse(amc).success).toBe(true))
  it('requires a property type', () =>
    expect(amcSchema.safeParse({...amc, propertyType: ''}).success).toBe(false))
  it('accepts a plan', () =>
    expect(amcSchema.safeParse({...amc, plan: 'commercial'}).success).toBe(true))
})
