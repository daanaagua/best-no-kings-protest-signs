import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

import { INTERNAL_MODERATION_BETA_MESSAGE } from '@/src/lib/launch-mode'
import { isCommunityMvpEnabled } from '@/src/lib/runtime-mode'
import {
  MODERATION_SESSION_COOKIE_NAME,
  isValidModerationSessionValue,
} from '@/src/lib/submissions/moderation-auth'
import { approveSubmission, rejectSubmission } from '@/src/lib/submissions/store'

export const runtime = 'nodejs'

type ModerationAction = 'approve' | 'reject'

function isFormSubmission(request: Request) {
  const contentType = request.headers.get('content-type') ?? ''

  return !contentType.includes('application/json')
}

async function readActionPayload(request: Request) {
  const contentType = request.headers.get('content-type') ?? ''

  if (contentType.includes('application/json')) {
    const payload = (await request.json()) as {
      action?: unknown
      moderatorNote?: unknown
    }

    return {
      action: payload.action,
      moderatorNote: payload.moderatorNote,
    }
  }

  const formData = await request.formData()

  return {
    action: formData.get('action'),
    moderatorNote: formData.get('moderatorNote'),
  }
}

function normalizeModeratorNote(value: unknown) {
  if (typeof value !== 'string') {
    return undefined
  }

  const normalized = value.trim()

  return normalized || undefined
}

function isModerationAction(value: unknown): value is ModerationAction {
  return value === 'approve' || value === 'reject'
}

function revalidateApprovedSubmissionPaths(submission: {
  slugCandidate: string
  categories: string[]
}) {
  revalidatePath('/')
  revalidatePath('/internal/moderation')
  revalidatePath(`/signs/${submission.slugCandidate}`)

  for (const category of new Set(submission.categories)) {
    revalidatePath(`/topics/no-kings/${category}`)
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!isCommunityMvpEnabled()) {
    return Response.json({ error: INTERNAL_MODERATION_BETA_MESSAGE }, { status: 503 })
  }

  const cookieStore = await cookies()
  const sessionValue = cookieStore.get(MODERATION_SESSION_COOKIE_NAME)?.value

  if (!isValidModerationSessionValue(sessionValue)) {
    return Response.json({ error: 'A valid moderation session is required.' }, { status: 401 })
  }

  let payload: Awaited<ReturnType<typeof readActionPayload>>

  try {
    payload = await readActionPayload(request)
  } catch {
    return Response.json({ error: 'Send a valid moderation action payload.' }, { status: 400 })
  }

  if (!isModerationAction(payload.action)) {
    return Response.json({ error: 'Action must be approve or reject.' }, { status: 400 })
  }

  const { id } = await context.params
  const moderatorNote = normalizeModeratorNote(payload.moderatorNote)

  try {
    const submission =
      payload.action === 'approve'
        ? await approveSubmission(id, moderatorNote)
        : await rejectSubmission(id, moderatorNote)

    if (payload.action === 'approve') {
      revalidateApprovedSubmissionPaths(submission)
    } else {
      revalidatePath('/internal/moderation')
    }

    if (isFormSubmission(request)) {
      return new Response(null, {
        status: 303,
        headers: {
          Location: '/internal/moderation',
        },
      })
    }

    return Response.json({
      submission: {
        id: submission.id,
        status: submission.status,
        slug: submission.slugCandidate,
        categories: submission.categories,
        approvedAt: submission.approvedAt,
        moderatorNote: submission.moderatorNote,
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Moderation failed.'

    if (message.includes('not found')) {
      return Response.json({ error: message }, { status: 404 })
    }

    if (message.includes('Only pending submissions')) {
      return Response.json({ error: message }, { status: 409 })
    }

    return Response.json({ error: 'Moderation failed.' }, { status: 500 })
  }
}
