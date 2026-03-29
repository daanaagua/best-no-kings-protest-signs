/* eslint-disable @next/next/no-img-element */

import { render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import Home from '@/app/page'

vi.mock('next/image', () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => <img {...props} alt={props.alt} />,
}))

describe('Home page', () => {
  it('keeps the homepage free of category-rail labels', () => {
    render(<Home />)

    expect(screen.queryByText(/Four fast ways into the sign wall/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/Browse by lane/i)).not.toBeInTheDocument()
  })

  it('keeps the homepage SEO copy focused on the core no-kings sign intent', () => {
    render(<Home />)

    const seoHeading = screen.getByRole('heading', {
      name: /What this no kings sign wall is built for/i,
    })
    const seoSection = seoHeading.closest('section')

    expect(seoSection).not.toBeNull()

    const scoped = within(seoSection as HTMLElement)

    expect(scoped.getByText(/No Kings protest signs/i)).toBeInTheDocument()
    expect(scoped.queryByRole('link', { name: /Funny No Kings signs/i })).not.toBeInTheDocument()
    expect(scoped.queryByText(/turning every card into a joke/i)).not.toBeInTheDocument()
  })

  it('shows eight editorial pick cards when enough picks exist', () => {
    render(<Home />)

    const editorialHeading = screen.getByRole('heading', {
      name: /Featured no kings protest signs/i,
    })
    const editorialSection = editorialHeading.closest('section')

    expect(editorialSection).not.toBeNull()
    expect(within(editorialSection as HTMLElement).getAllByRole('link', { name: /View sign/i })).toHaveLength(8)
  })

  it('avoids beta wording on the public homepage', () => {
    render(<Home />)

    expect(screen.queryByText(/beta/i)).not.toBeInTheDocument()
    expect(screen.getByText(/community signs keep the wall grounded in local rally language, shared tactics, and downloadable poster ideas/i)).toBeInTheDocument()
    expect(screen.queryByText(/humor/i)).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Make your sign/i })).toBeInTheDocument()
  })
})
