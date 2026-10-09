/**
 * Redirect matching (CLAUDE.md §11). Rules come from Sanity `redirect` documents.
 * - Paths compare case-insensitively, with or without a trailing slash.
 * - `from` ending in `/*` matches every path under that prefix (used for the old Wix store).
 * - Chains (A → B where B is also a rule) are collapsed to one hop to the final target.
 * - Loops (A → … → A) are skipped and reported, so they can never take the site down.
 */
export type RedirectRule = {from?: string | null; to?: string | null; type?: string | null}
export type Resolved = {status: 301 | 302 | 410; to?: string}
export type RedirectMap = {exact: Map<string, Resolved>; prefixes: Array<[string, Resolved]>; problems: string[]}

export function normalisePath(path: string): string {
  let p = path.split(/[?#]/)[0] ?? '/'
  try {
    p = decodeURI(p)
  } catch {
    // keep the raw path
  }
  p = p.toLowerCase().replace(/\/{2,}/g, '/')
  if (p.length > 1) p = p.replace(/\/+$/, '')
  return p || '/'
}

const statusOf = (t?: string | null): 301 | 302 | 410 => (t === '302' ? 302 : t === '410' ? 410 : 301)
const isAbsolute = (u: string) => /^https?:\/\//.test(u)

export function buildRedirectMap(rules: RedirectRule[]): RedirectMap {
  const problems: string[] = []
  const raw = new Map<string, {to?: string; status: 301 | 302 | 410}>()
  const prefixes: Array<[string, Resolved]> = []

  for (const r of rules) {
    if (!r.from || !r.from.startsWith('/')) continue
    const status = statusOf(r.type)
    if (status !== 410 && !r.to) {
      problems.push(`${r.from}: missing target`)
      continue
    }
    if (r.from.endsWith('/*')) {
      prefixes.push([normalisePath(r.from.slice(0, -2)), status === 410 ? {status} : {status, to: r.to!}])
      continue
    }
    const key = normalisePath(r.from)
    if (raw.has(key)) problems.push(`${r.from}: duplicate rule ignored`)
    else raw.set(key, {to: r.to ?? undefined, status})
  }

  const exact = new Map<string, Resolved>()
  for (const [from, rule] of raw) {
    if (rule.status === 410) {
      exact.set(from, {status: 410})
      continue
    }
    const seen = new Set([from])
    let target = rule.to!
    let status = rule.status
    let loop = false
    for (let hops = 0; hops < 10; hops++) {
      if (isAbsolute(target)) break
      const key = normalisePath(target)
      const next = raw.get(key)
      if (!next) break
      if (seen.has(key)) {
        loop = true
        break
      }
      seen.add(key)
      if (next.status === 410) break
      target = next.to!
      if (next.status === 302) status = 302
    }
    if (loop || (!isAbsolute(target) && normalisePath(target) === from)) {
      problems.push(`${from}: redirect loop skipped`)
      continue
    }
    if (seen.size > 1) problems.push(`${from}: chain collapsed to ${target}`)
    exact.set(from, {status, to: target})
  }
  prefixes.sort((a, b) => b[0].length - a[0].length)
  return {exact, prefixes, problems}
}

export function matchRedirect(map: RedirectMap, path: string): Resolved | null {
  const p = normalisePath(path)
  const hit = map.exact.get(p)
  if (hit) return hit
  for (const [prefix, res] of map.prefixes) if (p === prefix || p.startsWith(`${prefix}/`)) return res
  return null
}
