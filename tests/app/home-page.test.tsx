/* eslint-disable @next/next/no-img-element */

import { render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import Home from '@/app/page'

vi.mock('next/image', () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => <img {...props} alt={props.alt} />,
}))

describe('Home page', () => {
  it('links every category rail card to its category page', () => {
    render(<Home />)

    expect(screen.getByRole('link', { name: /Funny\s+\d+ signs\s+Now leading:/i })).toHaveAttribute(
      'href',
      '/topics/no-kings/funny',
    )
    expect(screen.getByRole('link', { name: /Best\s+\d+ signs\s+Now leading:/i })).toHaveAttribute(
      'href',
      '/topics/no-kings/best',
    )
    expect(screen.getByRole('link', { name: /Kids\s+\d+ signs\s+Now leading:/i })).toHaveAttribute(
      'href',
      '/topics/no-kings/kids',
    )
    expect(screen.getByRole('link', { name: /Printable\s+\d+ signs\s+Now leading:/i })).toHaveAttribute(
      'href',
      '/topics/no-kings/printable',
    )
  })

  it('includes internal SEO links to core category pages', () => {
    render(<Home />)

    const seoHeading = screen.getByRole('heading', {
      name: /Why people search for No Kings protest signs here/i,
    })
    const seoSection = seoHeading.closest('section')

    expect(seoSection).not.toBeNull()

    const scoped = within(seoSection as HTMLElement)

    expect(scoped.getByRole('link', { name: /Funny No Kings signs/i })).toHaveAttribute(
      'href',
      '/topics/no-kings/funny',
    )
    expect(scoped.getByRole('link', { name: /Best No Kings protest signs/i })).toHaveAttribute(
      'href',
      '/topics/no-kings/best',
    )
    expect(scoped.getByRole('link', { name: /family-friendly sign ideas/i })).toHaveAttribute(
      'href',
      '/topics/no-kings/kids',
    )
    expect(scoped.getByRole('link', { name: /printable No Kings protest posters/i })).toHaveAttribute(
      'href',
      '/topics/no-kings/printable',
    )
  })

  it('shows eight editorial pick cards when enough picks exist', () => {
    render(<Home />)

    const editorialHeading = screen.getByRole('heading', {
      name: /Editorial picks for marches, megaphones, and fast print runs/i,
    })
    const editorialSection = editorialHeading.closest('section')

    expect(editorialSection).not.toBeNull()
    expect(within(editorialSection as HTMLElement).getAllByRole('link', { name: /View sign/i })).toHaveLength(8)
  })
})
