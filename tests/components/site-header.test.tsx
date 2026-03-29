import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { SiteHeader } from '@/src/components/layout/site-header'

describe('SiteHeader', () => {
  it('renders the site brand and sign-maker link', () => {
    render(<SiteHeader />)

    expect(screen.getByText(/Best No Kings Protest Signs/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Make your sign/i })).toBeInTheDocument()
  })

  it('renders a skip link to the main content region', () => {
    render(<SiteHeader />)

    expect(screen.getByRole('link', { name: /Skip to content/i })).toHaveAttribute(
      'href',
      '#main-content',
    )
  })
})
