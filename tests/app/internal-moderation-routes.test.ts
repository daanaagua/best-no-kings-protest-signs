import { afterEach, describe, expect, it, vi } from 'vitest'

const SESSION_COOKIE_NAME = 'internal-moderation-session'

const approveSubmission = vi.fn()
const rejectSubmission = vi.fn()
const revalidatePath = vi.fn()
const cookieSet = vi.fn()
let sessionCookieValue: string | undefined

vi.mock('next/headers', () => ({
  cookies: async () => ({
    get(name: string) {
      if (name !== SESSION_COOKIE_NAME || !sessionCookieValue) {
        return undefined
      }

      return {
        value: sessionCookieValue,
      }
    },
    set: (...args: unknown[]) => cookieSet(...args),
  }),
}))

vi.mock('@/src/lib/submissions/store', () => ({
  approveSubmission: (...args: unknown[]) => approveSubmission(...args),
  rejectSubmission: (...args: unknown[]) => rejectSubmission(...args),
}))

vi.mock('next/cache', () => ({
  revalidatePath: (...args: unknown[]) => revalidatePath(...args),
}))

import { POST as postModerationSession } from '@/app/api/internal/moderation/session/route'
import { POST as postModerationSubmissionAction } from '@/app/api/internal/moderation/submissions/[id]/route'
import { createModerationSessionValue } from '@/src/lib/submissions/moderation-auth'

afterEach(() => {
  approveSubmission.mockReset()
  rejectSubmission.mockReset()
  revalidatePath.mockReset()
  cookieSet.mockReset()
  sessionCookieValue = undefined
  vi.unstubAllEnvs()
  vi.useRealTimers()
})

describe('internal moderation routes', () => {
  it('returns 503 for moderation login when community MVP is disabled', async () => {
    vi.stubEnv('ENABLE_COMMUNITY_MVP', 'false')
    vi.stubEnv('INTERNAL_MODERATION_TOKEN', 'launch-token')
    vi.stubEnv('INTERNAL_MODERATION_SESSION_SECRET', 'launch-secret')

    const response = await postModerationSession(
      new Request('http://localhost/api/internal/moderation/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: 'launch-token' }),
      }),
    )

    expect(response.status).toBe(503)
    expect(cookieSet).not.toHaveBeenCalled()
    await expect(response.json()).resolves.toMatchObject({
      error: expect.stringMatching(/not part of the public site experience/i),
    })
  })

  it('returns 401 for an invalid moderation token', async () => {
    vi.stubEnv('ENABLE_COMMUNITY_MVP', 'true')
    vi.stubEnv('INTERNAL_MODERATION_TOKEN', 'launch-token')
    vi.stubEnv('INTERNAL_MODERATION_SESSION_SECRET', 'launch-secret')

    const response = await postModerationSession(
      new Request('http://localhost/api/internal/moderation/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: 'wrong-token' }),
      }),
    )

    expect(response.status).toBe(401)
    expect(cookieSet).not.toHaveBeenCalled()
    await expect(response.json()).resolves.toMatchObject({
      error: expect.stringMatching(/invalid moderation token/i),
    })
  })

  it('stores a derived moderation session marker instead of the raw token', async () => {
    vi.stubEnv('ENABLE_COMMUNITY_MVP', 'true')
    vi.stubEnv('INTERNAL_MODERATION_TOKEN', 'launch-token')
    vi.stubEnv('INTERNAL_MODERATION_SESSION_SECRET', 'launch-secret')

    const response = await postModerationSession(
      new Request('http://localhost/api/internal/moderation/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: 'launch-token' }),
      }),
    )

    expect(response.status).toBe(200)
    expect(cookieSet).toHaveBeenCalledTimes(1)
    expect(cookieSet.mock.calls[0]?.[0]).toBe(SESSION_COOKIE_NAME)
    expect(cookieSet.mock.calls[0]?.[1]).not.toBe('launch-token')
    expect(String(cookieSet.mock.calls[0]?.[1])).not.toContain('launch-token')
    expect(cookieSet.mock.calls[0]?.[2]).toMatchObject({
      httpOnly: true,
      sameSite: 'lax',
    })
  })

  it('redirects form-based moderation login back to the moderation page on success', async () => {
    vi.stubEnv('ENABLE_COMMUNITY_MVP', 'true')
    vi.stubEnv('INTERNAL_MODERATION_TOKEN', 'launch-token')
    vi.stubEnv('INTERNAL_MODERATION_SESSION_SECRET', 'launch-secret')

    const body = new URLSearchParams({ token: 'launch-token' })
    const response = await postModerationSession(
      new Request('http://localhost/api/internal/moderation/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body,
      }),
    )

    expect(response.status).toBe(303)
    expect(response.headers.get('location')).toBe('/internal/moderation')
  })

  it.each(['approve', 'reject'] as const)(
    'returns 401 when %s is requested without a moderation session',
    async (action) => {
      vi.stubEnv('ENABLE_COMMUNITY_MVP', 'true')
      vi.stubEnv('INTERNAL_MODERATION_TOKEN', 'launch-token')
      vi.stubEnv('INTERNAL_MODERATION_SESSION_SECRET', 'launch-secret')

      const response = await postModerationSubmissionAction(
        new Request('http://localhost/api/internal/moderation/submissions/submission-1', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ action }),
        }),
        { params: Promise.resolve({ id: 'submission-1' }) },
      )

      expect(response.status).toBe(401)
      await expect(response.json()).resolves.toMatchObject({
        error: expect.stringMatching(/moderation session/i),
      })
    },
  )

  it('returns 503 for moderation actions when community MVP is disabled', async () => {
    vi.stubEnv('ENABLE_COMMUNITY_MVP', 'false')
    vi.stubEnv('INTERNAL_MODERATION_TOKEN', 'launch-token')
    vi.stubEnv('INTERNAL_MODERATION_SESSION_SECRET', 'launch-secret')
    sessionCookieValue = createModerationSessionValue()

    const response = await postModerationSubmissionAction(
      new Request('http://localhost/api/internal/moderation/submissions/submission-1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'approve' }),
      }),
      { params: Promise.resolve({ id: 'submission-1' }) },
    )

    expect(response.status).toBe(503)
    expect(approveSubmission).not.toHaveBeenCalled()
    expect(rejectSubmission).not.toHaveBeenCalled()
    await expect(response.json()).resolves.toMatchObject({
      error: expect.stringMatching(/not part of the public site experience/i),
    })
  })

  it('returns 401 when the moderation session has expired', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-29T00:00:00.000Z'))
    vi.stubEnv('ENABLE_COMMUNITY_MVP', 'true')
    vi.stubEnv('INTERNAL_MODERATION_TOKEN', 'launch-token')
    vi.stubEnv('INTERNAL_MODERATION_SESSION_SECRET', 'launch-secret')
    sessionCookieValue = createModerationSessionValue()

    vi.setSystemTime(new Date('2026-03-30T00:00:00.000Z'))

    const response = await postModerationSubmissionAction(
      new Request('http://localhost/api/internal/moderation/submissions/submission-1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'approve' }),
      }),
      { params: Promise.resolve({ id: 'submission-1' }) },
    )

    expect(response.status).toBe(401)
    expect(approveSubmission).not.toHaveBeenCalled()
  })

  it('approves a pending submission and returns status, slug, categories, and approvedAt', async () => {
    vi.stubEnv('ENABLE_COMMUNITY_MVP', 'true')
    vi.stubEnv('INTERNAL_MODERATION_TOKEN', 'launch-token')
    vi.stubEnv('INTERNAL_MODERATION_SESSION_SECRET', 'launch-secret')
    sessionCookieValue = createModerationSessionValue()
    approveSubmission.mockResolvedValue({
      id: 'submission-1',
      slogan: 'Power to the Public',
      slugCandidate: 'power-to-the-public-2',
      selectedTemplate: 'classic',
      primaryCategory: 'best',
      categories: ['best', 'printable'],
      textRotation: 0,
      textOffsetY: 0,
      textScale: 1,
      status: 'approved',
      createdAt: '2026-03-28T12:00:00.000Z',
      approvedAt: '2026-03-29T12:00:00.000Z',
      moderatorNote: 'Ready for the gallery',
    })

    const response = await postModerationSubmissionAction(
      new Request('http://localhost/api/internal/moderation/submissions/submission-1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'approve', moderatorNote: 'Ready for the gallery' }),
      }),
      { params: Promise.resolve({ id: 'submission-1' }) },
    )

    expect(approveSubmission).toHaveBeenCalledWith('submission-1', 'Ready for the gallery')
    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toMatchObject({
      submission: {
        id: 'submission-1',
        status: 'approved',
        slug: 'power-to-the-public-2',
        categories: ['best', 'printable'],
        approvedAt: '2026-03-29T12:00:00.000Z',
      },
    })
    expect(revalidatePath).toHaveBeenCalledWith('/')
    expect(revalidatePath).toHaveBeenCalledWith('/internal/moderation')
    expect(revalidatePath).toHaveBeenCalledWith('/signs/power-to-the-public-2')
    expect(revalidatePath).toHaveBeenCalledWith('/topics/no-kings/best')
    expect(revalidatePath).toHaveBeenCalledWith('/topics/no-kings/printable')
  })

  it('redirects form-based approval back to the moderation page on success', async () => {
    vi.stubEnv('ENABLE_COMMUNITY_MVP', 'true')
    vi.stubEnv('INTERNAL_MODERATION_TOKEN', 'launch-token')
    vi.stubEnv('INTERNAL_MODERATION_SESSION_SECRET', 'launch-secret')
    sessionCookieValue = createModerationSessionValue()
    approveSubmission.mockResolvedValue({
      id: 'submission-1',
      slogan: 'Power to the Public',
      slugCandidate: 'power-to-the-public-2',
      selectedTemplate: 'classic',
      primaryCategory: 'best',
      categories: ['best', 'printable'],
      textRotation: 0,
      textOffsetY: 0,
      textScale: 1,
      status: 'approved',
      createdAt: '2026-03-28T12:00:00.000Z',
      approvedAt: '2026-03-29T12:00:00.000Z',
    })

    const body = new URLSearchParams({ action: 'approve', moderatorNote: 'Ship it' })
    const response = await postModerationSubmissionAction(
      new Request('http://localhost/api/internal/moderation/submissions/submission-1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body,
      }),
      { params: Promise.resolve({ id: 'submission-1' }) },
    )

    expect(approveSubmission).toHaveBeenCalledWith('submission-1', 'Ship it')
    expect(response.status).toBe(303)
    expect(response.headers.get('location')).toBe('/internal/moderation')
  })

  it('redirects form-based rejection back to the moderation page and passes moderatorNote', async () => {
    vi.stubEnv('ENABLE_COMMUNITY_MVP', 'true')
    vi.stubEnv('INTERNAL_MODERATION_TOKEN', 'launch-token')
    vi.stubEnv('INTERNAL_MODERATION_SESSION_SECRET', 'launch-secret')
    sessionCookieValue = createModerationSessionValue()
    rejectSubmission.mockResolvedValue({
      id: 'submission-1',
      slogan: 'Power to the Public',
      slugCandidate: 'power-to-the-public',
      selectedTemplate: 'classic',
      primaryCategory: 'best',
      categories: ['best', 'printable'],
      textRotation: 0,
      textOffsetY: 0,
      textScale: 1,
      status: 'rejected',
      createdAt: '2026-03-28T12:00:00.000Z',
      moderatorNote: 'Duplicate slogan',
    })

    const body = new URLSearchParams({ action: 'reject', moderatorNote: 'Duplicate slogan' })
    const response = await postModerationSubmissionAction(
      new Request('http://localhost/api/internal/moderation/submissions/submission-1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body,
      }),
      { params: Promise.resolve({ id: 'submission-1' }) },
    )

    expect(rejectSubmission).toHaveBeenCalledWith('submission-1', 'Duplicate slogan')
    expect(response.status).toBe(303)
    expect(response.headers.get('location')).toBe('/internal/moderation')
  })
})
