import { PUBLIC_WRITE_API_ERROR } from '@/src/lib/launch-mode'
import { isCommunityMvpEnabled } from '@/src/lib/runtime-mode'
import { createPendingSubmission } from '@/src/lib/submissions/store'
import { validateSubmission } from '@/src/lib/submissions/validation'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  if (!isCommunityMvpEnabled()) {
    return Response.json({ error: PUBLIC_WRITE_API_ERROR }, { status: 503 })
  }

  let payload: unknown

  try {
    payload = await request.json()
  } catch {
    return Response.json({ error: 'Send a valid JSON body to create a submission.' }, { status: 400 })
  }

  const result = validateSubmission((payload ?? {}) as Parameters<typeof validateSubmission>[0])

  if (!result.success) {
    return Response.json(
      {
        error: 'Fix the highlighted fields and try again.',
        errors: result.errors,
      },
      { status: 422 },
    )
  }

  let submission

  try {
    submission = await createPendingSubmission(result.value)
  } catch {
    return Response.json(
      {
        error: 'We could not save your sign right now. Please try again.',
      },
      { status: 500 },
    )
  }

  return Response.json(
    {
      message: 'Your sign is pending review.',
      submission: {
        id: submission.id,
        slogan: submission.slogan,
        slugCandidate: submission.slugCandidate,
        selectedTemplate: submission.selectedTemplate,
        selectedTextColor: submission.selectedTextColor,
        textRotation: submission.textRotation,
        textOffsetY: submission.textOffsetY,
        textScale: submission.textScale,
        status: submission.status,
        createdAt: submission.createdAt,
      },
    },
    { status: 201 },
  )
}
