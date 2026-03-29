import { readFile } from 'node:fs/promises'
import path from 'node:path'

import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import CategoryPage, {
  generateMetadata as generateCategoryMetadata,
  generateStaticParams as generateCategoryStaticParams,
} from '@/app/topics/no-kings/[category]/page'
import SignPage from '@/app/signs/[slug]/page'
import {
  generateMetadata as generateSignMetadata,
} from '@/app/signs/[slug]/page'
import TopCategoryPage from '@/app/topics/no-kings/top/[category]/page'
import {
  generateMetadata as generateTopMetadata,
  generateStaticParams as generateTopStaticParams,
} from '@/app/topics/no-kings/top/[category]/page'
import { buildCategoryHref } from '@/src/components/home/category-rail'

describe('topic routes', () => {
  it('builds canonical metadata without trailing slashes for category, top, and sign routes', async () => {
    expect(buildCategoryHref('best')).toBe('/topics/no-kings/best')

    expect(generateCategoryStaticParams()).toEqual([
      { category: 'best' },
      { category: 'kids' },
      { category: 'printable' },
    ])
    expect(generateTopStaticParams()).toEqual([
      { category: 'best' },
      { category: 'kids' },
      { category: 'printable' },
    ])

    await expect(
      generateCategoryMetadata({ params: Promise.resolve({ category: 'best' }) }),
    ).resolves.toMatchObject({
      alternates: { canonical: '/topics/no-kings/best' },
      openGraph: { url: 'https://bestnokingsprotestsigns.org/topics/no-kings/best' },
    })

    await expect(
      generateTopMetadata({ params: Promise.resolve({ category: 'best' }) }),
    ).resolves.toMatchObject({
      alternates: { canonical: '/topics/no-kings/top/best' },
      openGraph: { url: 'https://bestnokingsprotestsigns.org/topics/no-kings/top/best' },
    })

    await expect(
      generateSignMetadata({ params: Promise.resolve({ slug: 'no-crown-for-a-clown' }) }),
    ).resolves.toMatchObject({
      alternates: { canonical: '/signs/no-crown-for-a-clown' },
      openGraph: { url: 'https://bestnokingsprotestsigns.org/signs/no-crown-for-a-clown' },
    })

    await expect(
      generateCategoryMetadata({ params: Promise.resolve({ category: 'funny' }) }),
    ).rejects.toMatchObject({ digest: 'NEXT_HTTP_ERROR_FALLBACK;404' })

    await expect(
      generateTopMetadata({ params: Promise.resolve({ category: 'funny' }) }),
    ).rejects.toMatchObject({ digest: 'NEXT_HTTP_ERROR_FALLBACK;404' })
  })

  it('does not generate funny topic routes or keep funny-only topic source content', async () => {
    const categoryRoutes = generateCategoryStaticParams().map(
      ({ category }) => `/topics/no-kings/${category}`,
    )
    const topRoutes = generateTopStaticParams().map(
      ({ category }) => `/topics/no-kings/top/${category}`,
    )

    expect(categoryRoutes).not.toContain('/topics/no-kings/funny')
    expect(topRoutes).not.toContain('/topics/no-kings/top/funny')

    const [categoryPageSource, topCategoryPageSource] = await Promise.all([
      readFile(path.join(process.cwd(), 'app/topics/no-kings/[category]/page.tsx'), 'utf8'),
      readFile(path.join(process.cwd(), 'app/topics/no-kings/top/[category]/page.tsx'), 'utf8'),
    ])

    expect(categoryPageSource).not.toContain('funny:')
    expect(topCategoryPageSource).not.toContain('funny:')
  })

  it('does not frame the best category as classic-versus-joke copy', async () => {
    render(await CategoryPage({ params: Promise.resolve({ category: 'best' }) }))

    expect(screen.queryByText(/over narrower joke formats/i)).not.toBeInTheDocument()
    expect(
      screen.queryByRole('heading', {
        level: 3,
        name: /when should i pick a classic sign instead of a joke sign/i,
      }),
    ).not.toBeInTheDocument()
  })

  it('keeps the kids category description free of humor framing', async () => {
    render(await CategoryPage({ params: Promise.resolve({ category: 'kids' }) }))

    expect(screen.queryByText(/classroom-ready humor/i)).not.toBeInTheDocument()
  })

  it('shows useful current leader details on category pages', async () => {
    render(await CategoryPage({ params: Promise.resolve({ category: 'best' }) }))

    const stat = screen.getByText('Current leader').closest('.topic-page__stat')

    expect(stat).not.toBeNull()

    const scoped = within(stat as HTMLElement)

    expect(scoped.getByText('No Crown for a Clown')).toBeInTheDocument()
    expect(scoped.getByText(/942 votes/i)).toBeInTheDocument()
    expect(scoped.queryByText('Best')).not.toBeInTheDocument()
  })

  it('renders task-6 internal links without trailing slashes', async () => {
    const { rerender } = render(
      await CategoryPage({ params: Promise.resolve({ category: 'best' }) }),
    )

    expect(screen.getByRole('link', { name: /See the ranked list/i })).toHaveAttribute(
      'href',
      '/topics/no-kings/top/best',
    )
    expect(
      screen.getByRole('link', { name: /Kids\s+\d+ sign ideas\s+Leading now:/i }),
    ).toHaveAttribute('href', '/topics/no-kings/kids')

    rerender(await TopCategoryPage({ params: Promise.resolve({ category: 'best' }) }))

    expect(
      screen.getByRole('link', { name: /Browse the full best idea wall/i }),
    ).toHaveAttribute('href', '/topics/no-kings/best')
    expect(screen.getByRole('link', { name: /Top Kids/i })).toHaveAttribute(
      'href',
      '/topics/no-kings/top/kids',
    )

    rerender(await SignPage({ params: Promise.resolve({ slug: 'no-crown-for-a-clown' }) }))

    expect(screen.getByRole('link', { name: /Category wall/i })).toHaveAttribute(
      'href',
      '/topics/no-kings/best',
    )
    expect(screen.getByRole('link', { name: /Top list/i })).toHaveAttribute(
      'href',
      '/topics/no-kings/top/best',
    )
  })
})
