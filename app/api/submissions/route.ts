import { createPendingSubmission } from '@/src/lib/submissions/store'
import { validateSubmission } from '@/src/lib/submissions/validation'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as
    | Record<string, unknown>
    | null

  const validationResult = validateSubmission({
    slogan: typeof payload?.slogan === 'string' ? payload.slogan : undefined,
    selectedTemplate:
      typeof payload?.selectedTemplate === 'string' ? payload.selectedTemplate : undefined,
    submitterName:
      typeof payload?.submitterName === 'string' ? payload.submitterName : undefined,
    submitterEmail:
      typeof payload?.submitterEmail === 'string' ? payload.submitterEmail : undefined,
    acceptedPolicy: payload?.acceptedPolicy === true,
    confirmedOwnership: payload?.confirmedOwnership === true,
  })

  if (!validationResult.success) {
    return Response.json(
      {
        error: 'Submission did not pass validation.',
        errors: validationResult.errors,
      },
      { status: 400 },
    )
  }

  const submission = await createPendingSubmission(validationResult.value)

  return Response.json({ submission }, { status: 201 })
}
