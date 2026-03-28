import { PUBLIC_WRITE_API_ERROR } from '@/src/lib/launch-mode'

export const runtime = 'nodejs'

export async function POST() {
  return Response.json({ error: PUBLIC_WRITE_API_ERROR }, { status: 503 })
}
