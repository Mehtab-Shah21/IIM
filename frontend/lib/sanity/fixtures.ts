/**
 * Fixture mode: when no Sanity project is configured (local development, CI), the same GROQ
 * queries run against the seed documents with groq-js, so results have exactly the shape
 * production returns. Drafts are excluded, matching the "published" perspective.
 */
import {evaluate, parse} from 'groq-js'

import seed from '@/content/seed/documents.json'

type Params = Record<string, unknown>

const published = (seed as Array<{_id: string}>).filter((doc) => !doc._id.startsWith('drafts.'))

export async function evaluateFixture<T>(query: string, params: Params = {}): Promise<T> {
  const tree = parse(query, {params})
  const value = await evaluate(tree, {dataset: published, params})
  return (await value.get()) as T
}
