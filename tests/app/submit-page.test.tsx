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
    expect(screen.getByText(/send your finished design to the moderation queue/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Submit styled sign for review/i })).toBeInTheDocument()
    expect(screen.queryByText(/preview-only|beta-gated|static launch beta/i)).not.toBeInTheDocument()
  })

  it('keeps the static preview path when community MVP mode is disabled', () => {
    vi.stubEnv('ENABLE_COMMUNITY_MVP', 'false')

    render(<SubmitPage />)

    expect(screen.getByText(/switch board templates, tune the text, and export a png/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Export PNG/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Submit styled sign for review/i })).not.toBeInTheDocument()
  })
})
