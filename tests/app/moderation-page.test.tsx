import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

const SESSION_COOKIE_NAME = 'internal-moderation-session'

const listPendingSubmissions = vi.fn()
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
  }),
}))

vi.mock('@/src/lib/submissions/store', () => ({
  listPendingSubmissions: (...args: unknown[]) => listPendingSubmissions(...args),
}))

import ModerationPage from '@/app/internal/moderation/page'
import { createModerationSessionValue } from '@/src/lib/submissions/moderation-auth'

afterEach(() => {
  listPendingSubmissions.mockReset()
  sessionCookieValue = undefined
  vi.unstubAllEnvs()
})

describe('ModerationPage', () => {
  it('shows the launch-gated state when community MVP mode is disabled', async () => {
    vi.stubEnv('ENABLE_COMMUNITY_MVP', 'false')
    vi.stubEnv('INTERNAL_MODERATION_TOKEN', 'launch-token')
    vi.stubEnv('INTERNAL_MODERATION_SESSION_SECRET', 'launch-secret')
    sessionCookieValue = createModerationSessionValue()
    listPendingSubmissions.mockResolvedValue([
      {
        id: 'submission-1',
        slogan: 'Power to the Public',
        slugCandidate: 'power-to-the-public',
        selectedTemplate: 'classic',
        primaryCategory: 'best',
        categories: ['best', 'printable'],
        textRotation: 0,
        textOffsetY: 0,
        textScale: 1,
        status: 'pending',
        createdAt: '2026-03-29T12:00:00.000Z',
      },
    ])

    render(await ModerationPage())

    expect(screen.getByText(/not part of the public site experience/i)).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /Moderation sign in/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /Pending submissions/i })).not.toBeInTheDocument()
    expect(listPendingSubmissions).not.toHaveBeenCalled()
  })

  it('shows a missing-config state when moderation auth is not configured', async () => {
    vi.stubEnv('ENABLE_COMMUNITY_MVP', 'true')

    render(await ModerationPage())

    expect(screen.getByRole('heading', { name: /Moderation config missing/i })).toBeInTheDocument()
    expect(
      screen.getByText(/set internal_moderation_token and internal_moderation_session_secret/i),
    ).toBeInTheDocument()
  })

  it('shows a login form when moderation auth is configured but no session is active', async () => {
    vi.stubEnv('ENABLE_COMMUNITY_MVP', 'true')
    vi.stubEnv('INTERNAL_MODERATION_TOKEN', 'launch-token')
    vi.stubEnv('INTERNAL_MODERATION_SESSION_SECRET', 'launch-secret')

    render(await ModerationPage())

    expect(screen.getByRole('heading', { name: /Moderation sign in/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/moderation token/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Start moderation session/i })).toBeInTheDocument()
  })

  it('shows the pending queue when a valid moderation session is active', async () => {
    vi.stubEnv('ENABLE_COMMUNITY_MVP', 'true')
    vi.stubEnv('INTERNAL_MODERATION_TOKEN', 'launch-token')
    vi.stubEnv('INTERNAL_MODERATION_SESSION_SECRET', 'launch-secret')
    sessionCookieValue = createModerationSessionValue()
    listPendingSubmissions.mockResolvedValue([
      {
        id: 'submission-1',
        slogan: 'Power to the Public',
        slugCandidate: 'power-to-the-public',
        selectedTemplate: 'classic',
        primaryCategory: 'best',
        categories: ['best', 'printable'],
        submitterName: 'Dana Rivers',
        submitterEmail: 'dana@example.com',
        textRotation: 0,
        textOffsetY: 0,
        textScale: 1,
        status: 'pending',
        createdAt: '2026-03-29T12:00:00.000Z',
      },
    ])

    render(await ModerationPage())

    expect(screen.getByRole('heading', { name: /Pending submissions/i })).toBeInTheDocument()
    expect(screen.getByText(/Power to the Public/i)).toBeInTheDocument()
    expect(screen.getByText(/best, printable/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Approve submission-1/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Reject submission-1/i })).toBeInTheDocument()
  })
})
