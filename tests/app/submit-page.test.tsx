import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import * as SubmitPageModule from '@/app/submit/page'

const SubmitPage = SubmitPageModule.default

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('Submit page', () => {
  it('forces dynamic rendering so launch copy stays runtime-aware', () => {
    expect(SubmitPageModule.dynamic).toBe('force-dynamic')
  })

  it('shows the real community submission flow when community MVP mode is enabled', () => {
    vi.stubEnv('ENABLE_COMMUNITY_MVP', 'true')

    render(<SubmitPage />)

    expect(screen.getByRole('heading', { name: /Make your No Kings sign/i })).toBeInTheDocument()
    expect(screen.getByText(/add text boxes and images freely, then send the finished board to moderation/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Submit styled sign for review/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Browse all best No Kings protest signs/i })).toHaveAttribute(
      'href',
      '/',
    )
    expect(screen.queryByText(/preview-only|beta-gated|static launch beta/i)).not.toBeInTheDocument()
  })

  it('keeps the static preview path when community MVP mode is disabled', () => {
    vi.stubEnv('ENABLE_COMMUNITY_MVP', 'false')

    render(<SubmitPage />)

    expect(screen.getByText(/place text and images directly on the sign, and export a png ready for print or sharing/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Export PNG/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Submit styled sign for review/i })).not.toBeInTheDocument()
  })
})
