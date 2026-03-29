import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { SiteFooter } from '@/src/components/layout/site-footer'

describe('SiteFooter', () => {
  it('includes a descriptive homepage link for the main keyword target', () => {
    render(<SiteFooter />)

    expect(screen.getByRole('link', { name: /Best No Kings protest signs home/i })).toHaveAttribute(
      'href',
      '/',
    )
  })

  it('includes a contact link', () => {
    render(<SiteFooter />)

    expect(screen.getByRole('link', { name: /contact/i })).toHaveAttribute('href', '/contact')
  })
})
