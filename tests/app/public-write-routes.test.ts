import { afterEach, describe, expect, it, vi } from 'vitest'

const createPendingSubmission = vi.fn()

vi.mock('@/src/lib/submissions/store', () => ({
  createPendingSubmission: (...args: unknown[]) => createPendingSubmission(...args),
}))

import { POST as postSubmission } from '@/app/api/submissions/route'
import { POST as postVote } from '@/app/api/votes/route'

afterEach(() => {
  createPendingSubmission.mockReset()
  vi.unstubAllEnvs()
})

describe('public write routes', () => {
  it('creates a pending submission when community MVP is enabled', async () => {
    vi.stubEnv('ENABLE_COMMUNITY_MVP', 'true')
    createPendingSubmission.mockResolvedValue({
      id: 'submission-1',
      slogan: 'Power to the Public',
      slugCandidate: 'power-to-the-public',
      selectedTemplate: 'printable',
      primaryCategory: 'printable',
      categories: ['printable', 'best'],
      submitterName: 'Dana Rivers',
      submitterEmail: 'dana@example.com',
      selectedTextColor: 'signal-red',
      textRotation: 18,
      textOffsetY: 12,
      textScale: 1.14,
      status: 'pending',
      createdAt: '2026-03-29T12:00:00.000Z',
    })

    const response = await postSubmission(
      new Request('http://localhost/api/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          slogan: '  Power to the Public  ',
          selectedTemplate: 'printable',
          submitterName: '  Dana Rivers  ',
          submitterEmail: ' DANA@example.com ',
          selectedTextColor: 'signal-red',
          textRotation: 18,
          textOffsetY: 12,
          textScale: 1.14,
          acceptedPolicy: true,
          confirmedOwnership: true,
        }),
      }),
    )

    expect(createPendingSubmission).toHaveBeenCalledWith({
      slogan: 'Power to the Public',
      slugCandidate: 'power-to-the-public',
      selectedTemplate: 'printable',
      primaryCategory: 'printable',
      categories: ['printable', 'best'],
      submitterName: 'Dana Rivers',
      submitterEmail: 'dana@example.com',
      selectedTextColor: 'signal-red',
      textRotation: 18,
      textOffsetY: 12,
      textScale: 1.14,
    })

    expect(response.status).toBe(201)

    const body = await response.json()

    expect(body).toMatchObject({
      submission: {
        id: 'submission-1',
        slogan: 'Power to the Public',
        slugCandidate: 'power-to-the-public',
        selectedTemplate: 'printable',
        selectedTextColor: 'signal-red',
        textRotation: 18,
        textOffsetY: 12,
        textScale: 1.14,
        status: 'pending',
        createdAt: '2026-03-29T12:00:00.000Z',
      },
      message: expect.stringMatching(/review/i),
    })
    expect(body.submission).not.toHaveProperty('submitterEmail')
  })

  it('returns beta-gated responses for public submissions when community MVP is disabled', async () => {
    vi.stubEnv('ENABLE_COMMUNITY_MVP', 'false')

    const response = await postSubmission(
      new Request('http://localhost/api/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          slogan: 'Power to the Public',
          selectedTemplate: 'classic',
          acceptedPolicy: true,
          confirmedOwnership: true,
        }),
      }),
    )

    expect(response.status).toBe(503)
    await expect(response.json()).resolves.toMatchObject({
      error: expect.stringMatching(/disabled during the static launch beta/i),
    })
    expect(createPendingSubmission).not.toHaveBeenCalled()
  })

  it('returns a structured 500 response when pending submission creation fails', async () => {
    vi.stubEnv('ENABLE_COMMUNITY_MVP', 'true')
    createPendingSubmission.mockRejectedValue(new Error('disk full'))

    const response = await postSubmission(
      new Request('http://localhost/api/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          slogan: 'Power to the Public',
          selectedTemplate: 'classic',
          submitterEmail: 'dana@example.com',
          acceptedPolicy: true,
          confirmedOwnership: true,
        }),
      }),
    )

    expect(response.status).toBe(500)
    await expect(response.json()).resolves.toMatchObject({
      error: expect.stringMatching(/could not save your sign/i),
    })
  })

  it('returns beta-gated responses for public votes', async () => {
    const response = await postVote()

    expect(response.status).toBe(503)
    await expect(response.json()).resolves.toMatchObject({
      error: expect.stringMatching(/disabled during the static launch beta/i),
    })
  })
})
