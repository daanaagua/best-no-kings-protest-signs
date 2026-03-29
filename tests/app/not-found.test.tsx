import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import NotFound from '@/app/not-found'

describe('NotFound page', () => {
  it('keeps fallback copy aligned with the live tool experience', () => {
    render(<NotFound />)

    expect(screen.getByRole('heading', { name: /That poster board is blank/i })).toBeInTheDocument()
    expect(screen.getByText(/make a new sign in the builder/i)).toBeInTheDocument()
    expect(screen.getByText('Best')).toBeInTheDocument()
    expect(screen.getByText('/topics/no-kings/best')).toBeInTheDocument()
    expect(screen.queryByText(/funny/i)).not.toBeInTheDocument()
    expect(screen.queryByText('/topics/no-kings/funny')).not.toBeInTheDocument()
    expect(screen.queryByText(/beta|preview-only|reopen/i)).not.toBeInTheDocument()
  })
})
