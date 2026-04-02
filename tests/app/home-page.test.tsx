/* eslint-disable @next/next/no-img-element */

import { render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import Home from '@/app/page'

vi.mock('next/image', () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => <img {...props} alt={props.alt} />,
}))

describe('Home page', () => {
  it('shows the sign maker product update card on the homepage', async () => {
    render(await Home())

    expect(screen.getByText(/Product update/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Read the update/i })).toHaveAttribute(
      'href',
      '/updates/blank-board-designer',
    )
  })

  it('hides the recent community section when no approved real submissions exist', async () => {
    render(await Home())

    expect(
      screen.queryByRole('heading', { name: /Recent community signs/i }),
    ).not.toBeInTheDocument()
    expect(document.getElementById('community-signs')).toBeNull()
  })

  it('keeps the homepage free of category-rail labels', async () => {
    render(await Home())

    expect(screen.queryByText(/Four fast ways into the sign wall/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/Browse by lane/i)).not.toBeInTheDocument()
  })

  it('keeps the homepage SEO copy focused on the core no-kings sign intent', async () => {
    render(await Home())

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /Best No Kings protest signs built to read clearly at marches, rallies, and on the street/i,
      }),
    ).toBeInTheDocument()

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

  it('shows eight editorial pick cards when enough picks exist', async () => {
    render(await Home())

    const editorialHeading = screen.getByRole('heading', {
      name: /Featured no kings protest signs/i,
    })
    const editorialSection = editorialHeading.closest('section')

    expect(editorialSection).not.toBeNull()
    expect(within(editorialSection as HTMLElement).getAllByRole('link', { name: /View sign/i })).toHaveLength(8)
  })

  it('avoids beta wording on the public homepage', async () => {
    render(await Home())

    expect(screen.queryByText(/beta/i)).not.toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { name: /Recent community signs/i }),
    ).not.toBeInTheDocument()
    expect(screen.queryByText(/humor/i)).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Make your sign/i })).toBeInTheDocument()
  })

  it('renders the recent community section when async public queries return approved submissions', async () => {
    vi.resetModules()
    vi.doMock('@/src/lib/signs/queries', async () => {
      const actual = await vi.importActual<typeof import('@/src/lib/signs/queries')>(
        '@/src/lib/signs/queries',
      )

      return {
        ...actual,
        getAllSignsAsync: async () => [
          {
            slug: 'official-sign',
            title: 'Official Sign',
            slogan: 'Official Sign',
            topic: 'no-kings',
            primaryCategory: 'best',
            categories: ['best'],
            image: '/official-sign.jpg',
            description: 'Official sign',
            createdAt: '2026-03-20T12:00:00.000Z',
            voteCount: 10,
            sourceType: 'official',
          },
          {
            slug: 'town-hall-over-throne-room',
            title: 'Town Hall Over Throne Room',
            slogan: 'Town Hall Over Throne Room',
            topic: 'no-kings',
            primaryCategory: 'best',
            categories: ['best', 'printable'],
            image: '/town-hall.jpg',
            description: 'Community sign',
            createdAt: '2026-03-29T10:30:00.000Z',
            voteCount: 12,
            sourceType: 'community',
          },
        ],
        getApprovedHomepageCommunitySignsAsync: async () => [
          {
            slug: 'town-hall-over-throne-room',
            title: 'Town Hall Over Throne Room',
            slogan: 'Town Hall Over Throne Room',
            topic: 'no-kings',
            primaryCategory: 'best',
            categories: ['best', 'printable'],
            image: '/town-hall.jpg',
            description: 'Community sign',
            createdAt: '2026-03-29T10:30:00.000Z',
            voteCount: 12,
            sourceType: 'community',
          },
        ],
      }
    })

    const { default: RuntimeHome } = await import('@/app/page')

    render(await RuntimeHome())

    const communityHeading = screen.getByRole('heading', { name: /Recent community signs/i })
    const communitySection = communityHeading.closest('section')

    expect(communityHeading).toBeInTheDocument()
    expect(communitySection).not.toBeNull()
    expect(
      within(communitySection as HTMLElement).getByRole('heading', {
        name: /Town Hall Over Throne Room/i,
      }),
    ).toBeInTheDocument()
  })
})
