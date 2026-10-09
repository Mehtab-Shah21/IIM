import {randomInt} from 'node:crypto'

/** Crockford base32 without I, L, O, U: readable over the phone. */
const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'

/**
 * Lead reference IIM-YYMMDD-XXXX (Dubai date). 32^4 ≈ 1M combinations per day, from a CSPRNG;
 * `exists` lets callers retry on the (very unlikely) collision.
 */
export function newReference(now: Date = new Date(), exists: (ref: string) => boolean = () => false): string {
  const ymd = new Intl.DateTimeFormat('en-GB', {timeZone: 'Asia/Dubai', year: '2-digit', month: '2-digit', day: '2-digit'})
    .formatToParts(now)
    .reduce<Record<string, string>>((acc, p) => ({...acc, [p.type]: p.value}), {})
  for (let attempt = 0; attempt < 10; attempt++) {
    let code = ''
    for (let i = 0; i < 4; i++) code += ALPHABET[randomInt(ALPHABET.length)]
    const ref = `IIM-${ymd.year}${ymd.month}${ymd.day}-${code}`
    if (!exists(ref)) return ref
  }
  throw new Error('Could not generate a unique reference')
}

export const REFERENCE_PATTERN = /^IIM-\d{6}-[0-9A-HJKMNP-TV-Z]{4}$/
