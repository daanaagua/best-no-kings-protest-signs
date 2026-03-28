import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import ModerationPage from '@/app/internal/moderation/page'

describe('ModerationPage', () => {
  it('does not frame the route as a public launch feature', async () => {
    render(await ModerationPage({ searchParams: Promise.resolve({}) }))

    expect(screen.getByRole('heading', { name: /Moderation token required/i })).toBeInTheDocument()
    expect(screen.getByText(/internal-only beta route/i)).toBeInTheDocument()
    expect(screen.getByText(/not part of the public static launch/i)).toBeInTheDocument()
  })
})
