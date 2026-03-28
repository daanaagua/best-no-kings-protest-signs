import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import ModerationPage from '@/app/internal/moderation/page'

describe('ModerationPage', () => {
  it('does not frame the route as a public launch feature', async () => {
    render(<ModerationPage />)

    expect(screen.getByRole('heading', { name: /Internal workflow placeholder/i })).toBeInTheDocument()
    expect(screen.getByText(/internal-only beta route/i)).toBeInTheDocument()
    expect(screen.getByText(/not a live moderation dashboard/i)).toBeInTheDocument()
  })
})
