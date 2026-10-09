/**
 * Fixture mode: when no Sanity project is configured (local development, CI), the same GROQ
 * queries run against the seed documents with groq-js, so results have exactly the shape
 * production returns. Drafts are excluded, matching the "published" perspective.
 */
import {evaluate, parse} from 'groq-js'

import seed from '@/content/seed/documents.json'

type Params = Record<string, unknown>

const docs = seed as Array<{_id: string}>
const published = docs.filter((doc) => !doc._id.startsWith('drafts.'))

/** Published documents with drafts laid over them (the "drafts" perspective). */
const withDrafts = [
  ...published.filter((doc) => !docs.some((d) => d._id === `drafts.${doc._id}`)),
  ...docs
    .filter((doc) => doc._id.startsWith('drafts.'))
    .map((doc) => ({...doc, _id: doc._id.slice('drafts.'.length)})),
]

export async function evaluateFixture<T>(
  query: string,
  params: Params = {},
  {drafts = false}: {drafts?: boolean} = {},
): Promise<T> {
  const tree = parse(query, {params})
  const value = await evaluate(tree, {dataset: drafts ? withDrafts : published, params})
  return (await value.get()) as T
}
