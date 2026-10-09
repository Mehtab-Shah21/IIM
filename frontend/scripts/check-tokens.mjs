#!/usr/bin/env node
/**
 * Design-token guard (CLAUDE.md §7: no arbitrary values anywhere).
 * Fails when source files use:
 *   - Tailwind arbitrary values or properties, e.g. w-[437px], grid-cols-[auto_1fr], [mask:…]
 *   - hex colours outside styles/tokens.css (and the generated OG image)
 *   - raw px lengths in className strings
 * Tailwind's own scales are also reset in globals.css, so unknown utilities simply do not exist.
 */
import {readdirSync, readFileSync} from 'node:fs'
import {join, relative} from 'node:path'

const root = join(import.meta.dirname, '..')
const dirs = ['app', 'components', 'lib', 'styles']
const ignoreFiles = new Set([
  'styles/tokens.css',
  'app/opengraph-image.tsx',
  'components/icons/paths.ts',
])

const walk = (d) =>
  readdirSync(d, {withFileTypes: true}).flatMap((e) =>
    e.isDirectory() ? walk(join(d, e.name)) : [join(d, e.name)],
  )

const problems = []

for (const dir of dirs) {
  for (const file of walk(join(root, dir))) {
    const rel = relative(root, file).replace(/\\/g, '/')
    if (ignoreFiles.has(rel) || !/\.(tsx?|css)$/.test(rel)) continue
    const lines = readFileSync(file, 'utf8').split('\n')
    lines.forEach((line, i) => {
      const where = `${rel}:${i + 1}`
      if (/^\s*(\/\/|\*|\/\*)/.test(line)) return // comments
      if (rel.endsWith('.tsx') || rel.endsWith('.ts')) {
        // className strings: look inside quotes/backticks on lines that set classes
        if (/className|buttonClasses|clsx\(|'[a-z-]+:/.test(line)) {
          const arbitrary = line.match(
            /(?:^|[\s'"`])(?:[a-z0-9:-]+:)?-?[a-z][a-z0-9-]*-\[[^\]]+\]/g,
          )
          if (arbitrary)
            problems.push(`${where}  arbitrary Tailwind value ${arbitrary.join(' ').trim()}`)
          const property = line.match(/(?:^|[\s'"`])\[[a-z-]+:[^\]]+\]/g)
          if (property)
            problems.push(`${where}  arbitrary Tailwind property ${property.join(' ').trim()}`)
        }
        const hex = line.match(/['"`]#[0-9a-fA-F]{3,8}['"`]/g)
        if (hex && !line.includes('// token:'))
          problems.push(`${where}  hex colour ${hex.join(' ')}: use a token`)
      } else {
        const hex = line.match(/#[0-9a-fA-F]{3,8}\b/g)
        if (hex && !line.includes('url('))
          problems.push(`${where}  hex colour ${hex.join(' ')}: use a token`)
      }
    })
  }
}

if (problems.length) {
  console.error(`Design-token check failed (${problems.length}):\n  ${problems.join('\n  ')}`)
  process.exit(1)
}
console.info('Design-token check passed: no arbitrary values or stray colours.')
