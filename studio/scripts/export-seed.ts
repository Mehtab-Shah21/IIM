/**
 * Converts the shared seed (frontend/content/seed/documents.json, built by
 * frontend/scripts/build-seed.mjs) into an NDJSON file for `sanity dataset import`.
 *
 *   npm run seed:export            -> studio/seed/seed.ndjson
 *   npm run seed:import            -> imports it into the production dataset (--replace)
 *
 * Draft documents (`drafts.*`) are kept, so unconfirmed pages arrive unpublished, exactly
 * as they behave in fixture mode. Local photos (`sanity.imageAsset` seed documents with a
 * `localPath`) become `_sanityAsset: "image@file://…"` references, which `sanity dataset
 * import` uploads as real Sanity assets.
 */
import {existsSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs'
import {dirname, resolve} from 'node:path'
import {pathToFileURL} from 'node:url'

type SeedDocument = {_id: string; _type: string; [key: string]: unknown}

const source = resolve(process.cwd(), '../frontend/content/seed/documents.json')
const target = resolve(process.cwd(), 'seed/seed.ndjson')

const all = JSON.parse(readFileSync(source, 'utf8')) as SeedDocument[]
const repoRoot = resolve(process.cwd(), '..')

// Local photo assets: id -> file URL for the importer.
const localAssets = new Map<string, string>()
for (const doc of all) {
  if (doc._type !== 'sanity.imageAsset') continue
  const file = resolve(repoRoot, String(doc.localPath))
  if (!existsSync(file)) throw new Error(`Missing photo for ${doc._id}: ${file}`)
  localAssets.set(doc._id, pathToFileURL(file).href)
}

/** Replaces {asset: {_ref: <local asset>}} with {_sanityAsset: "image@file://…"}, recursively. */
function withUploads(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(withUploads)
  if (!value || typeof value !== 'object') return value
  const obj = value as Record<string, unknown>
  const assetRef = (obj.asset as {_ref?: string} | undefined)?._ref
  if (assetRef && localAssets.has(assetRef)) {
    const {asset: _asset, ...rest} = obj
    return {...rest, _type: 'image', _sanityAsset: `image@${localAssets.get(assetRef)}`}
  }
  return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, withUploads(v)]))
}

const documents = all
  .filter((doc) => doc._type !== 'sanity.imageAsset')
  .map((doc) => withUploads(doc) as SeedDocument)

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
console.log(
  `Wrote ${documents.length} documents (${drafts} drafts, ${localAssets.size} photos to upload) to ${target}`,
)
