import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import SubmitPage from '@/app/submit/page'

describe('Submit page', () => {
  it('positions the route as a live sign-making tool', () => {
    render(<SubmitPage />)

    expect(screen.getByRole('heading', { name: /Make your No Kings sign/i })).toBeInTheDocument()
    expect(screen.getByText(/switch board templates, tune the text, and export a png/i)).toBeInTheDocument()
    expect(screen.queryByText(/beta|preview-only|coming soon|reopen/i)).not.toBeInTheDocument()
  })
})
