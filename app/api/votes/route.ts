import { getSignBySlug } from '@/src/lib/signs/queries'
import { incrementVoteCount } from '@/src/lib/submissions/store'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as { slug?: unknown } | null
  const slug = typeof payload?.slug === 'string' ? payload.slug.trim() : ''

  if (!slug) {
    return Response.json({ error: 'A sign slug is required.' }, { status: 400 })
  }

  const sign = getSignBySlug(slug)

  if (!sign) {
    return Response.json({ error: 'That sign does not exist.' }, { status: 404 })
  }

  const voteCount = await incrementVoteCount(slug, sign.voteCount)

  return Response.json({ slug, voteCount }, { status: 201 })
}
