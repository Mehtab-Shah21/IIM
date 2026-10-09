/**
 * Converts the shared seed (frontend/content/seed/documents.json, built by
 * frontend/scripts/build-seed.mjs) into an NDJSON file for `sanity dataset import`.
 *
 *   npm run seed:export            -> studio/seed/seed.ndjson
 *   npm run seed:import            -> imports it into the production dataset (--replace)
 *
 * Draft documents (`drafts.*`) are kept, so unconfirmed pages arrive unpublished, exactly
 * as they behave in fixture mode. The seed holds no image assets: photos are added in the
 * Studio once the owner supplies them (PLACEHOLDERS.md).
 */
import {mkdirSync, readFileSync, writeFileSync} from 'node:fs'
import {dirname, resolve} from 'node:path'

type SeedDocument = {_id: string; _type: string; [key: string]: unknown}

const source = resolve(process.cwd(), '../frontend/content/seed/documents.json')
const target = resolve(process.cwd(), 'seed/seed.ndjson')

const documents = JSON.parse(readFileSync(source, 'utf8')) as SeedDocument[]

const ids = new Set<string>()
for (const doc of documents) {
  if (!doc._id || !doc._type)
    throw new Error(`Seed document without _id or _type: ${JSON.stringify(doc).slice(0, 120)}`)
  if (ids.has(doc._id)) throw new Error(`Duplicate _id in seed: ${doc._id}`)
  ids.add(doc._id)
}

mkdirSync(dirname(target), {recursive: true})
writeFileSync(target, documents.map((doc) => JSON.stringify(doc)).join('\n') + '\n')

const drafts = documents.filter((doc) => doc._id.startsWith('drafts.')).length
console.log(`Wrote ${documents.length} documents (${drafts} drafts) to ${target}`)
