/**
 * Sanity publish webhook → on-demand revalidation (backup to SanityLive).
 * The webhook (docs/MANUAL_TASKS.md T2) sends {_type, slug} signed with SANITY_REVALIDATE_SECRET.
 */
import {revalidateTag} from 'next/cache'
import {type NextRequest, NextResponse} from 'next/server'
import {parseBody} from 'next-sanity/webhook'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET
  if (!secret) return NextResponse.json({ok: false, message: 'Not configured'}, {status: 500})
  try {
    const {isValidSignature, body} = await parseBody<{_type?: string; slug?: string}>(req, secret, true)
    if (!isValidSignature) return NextResponse.json({ok: false, message: 'Invalid signature'}, {status: 401})
    if (!body?._type) return NextResponse.json({ok: false, message: 'Missing _type'}, {status: 400})
    revalidateTag(body._type, 'max')
    console.info(JSON.stringify({event: 'revalidated', type: body._type}))
    return NextResponse.json({ok: true, revalidated: body._type})
  } catch (err) {
    console.error(JSON.stringify({event: 'revalidate_failed', error: err instanceof Error ? err.message : 'unknown'}))
    return NextResponse.json({ok: false}, {status: 500})
  }
}
