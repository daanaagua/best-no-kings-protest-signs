import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import ContactPage, { metadata } from '@/app/contact/page'

describe('Contact page', () => {
  it('renders the tally iframe with hidden-title embed parameters', () => {
    render(<ContactPage />)

    const frame = screen.getByTitle(/contact form/i)

    expect(frame).toHaveAttribute('src', expect.stringContaining('https://tally.so/embed/vG48ad'))
    expect(frame).toHaveAttribute('src', expect.stringContaining('hideTitle=1'))
    expect(frame).toHaveAttribute('src', expect.stringContaining('transparentBackground=1'))
    expect(frame).toHaveAttribute('src', expect.stringContaining('dynamicHeight=1'))
  })

  it('publishes contact metadata', () => {
    expect(metadata.title).toMatch(/Contact/i)
    expect(metadata.alternates?.canonical).toBe('/contact')
  })

  it('keeps the page visually minimal around the embed', () => {
    render(<ContactPage />)

    const frame = screen.getByTitle(/contact form/i)

    expect(frame).toBeInTheDocument()
    expect(frame).toHaveClass('contact-page__frame')
    expect(document.querySelector('.contact-page')).not.toBeNull()
    expect(document.querySelector('.contact-page__panel')).not.toBeNull()
  })
})
