import { cookies } from 'next/headers'

import { INTERNAL_MODERATION_BETA_MESSAGE } from '@/src/lib/launch-mode'
import { isCommunityMvpEnabled } from '@/src/lib/runtime-mode'
import {
  createModerationSessionCookie,
  isModerationAuthConfigured,
  isValidModerationToken,
} from '@/src/lib/submissions/moderation-auth'

export const runtime = 'nodejs'

function isFormSubmission(request: Request) {
  const contentType = request.headers.get('content-type') ?? ''

  return !contentType.includes('application/json')
}

async function readToken(request: Request) {
  const contentType = request.headers.get('content-type') ?? ''

  if (contentType.includes('application/json')) {
    const payload = (await request.json()) as { token?: unknown }

    return typeof payload.token === 'string' ? payload.token : undefined
  }

  const formData = await request.formData()
  const value = formData.get('token')

  return typeof value === 'string' ? value : undefined
}

export async function POST(request: Request) {
  if (!isCommunityMvpEnabled()) {
    return Response.json({ error: INTERNAL_MODERATION_BETA_MESSAGE }, { status: 503 })
  }

  if (!isModerationAuthConfigured()) {
    return Response.json(
      {
        error: 'Moderation auth is not configured.',
      },
      { status: 503 },
    )
  }

  let token: string | undefined

  try {
    token = await readToken(request)
  } catch {
    return Response.json({ error: 'Send a valid moderation token.' }, { status: 400 })
  }

  if (!isValidModerationToken(token)) {
    return Response.json({ error: 'Invalid moderation token.' }, { status: 401 })
  }

  const sessionCookie = createModerationSessionCookie()
  const cookieStore = await cookies()

  cookieStore.set(sessionCookie.name, sessionCookie.value, sessionCookie.options)

  if (isFormSubmission(request)) {
    return new Response(null, {
      status: 303,
      headers: {
        Location: '/internal/moderation',
      },
    })
  }

  return Response.json({ status: 'authenticated' })
}
