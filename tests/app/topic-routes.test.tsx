import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import CategoryPage, {
  generateMetadata as generateCategoryMetadata,
} from '@/app/topics/no-kings/[category]/page'
import {
  generateMetadata as generateSignMetadata,
} from '@/app/signs/[slug]/page'
import {
  generateMetadata as generateTopMetadata,
} from '@/app/topics/no-kings/top/[category]/page'

describe('topic routes', () => {
  it('builds canonical metadata without trailing slashes for category, top, and sign routes', async () => {
    await expect(
      generateCategoryMetadata({ params: Promise.resolve({ category: 'funny' }) }),
    ).resolves.toMatchObject({
      alternates: { canonical: '/topics/no-kings/funny' },
      openGraph: { url: 'https://bestnokingsprotestsigns.org/topics/no-kings/funny' },
    })

    await expect(
      generateTopMetadata({ params: Promise.resolve({ category: 'funny' }) }),
    ).resolves.toMatchObject({
      alternates: { canonical: '/topics/no-kings/top/funny' },
      openGraph: { url: 'https://bestnokingsprotestsigns.org/topics/no-kings/top/funny' },
    })

    await expect(
      generateSignMetadata({ params: Promise.resolve({ slug: 'no-crown-for-a-clown' }) }),
    ).resolves.toMatchObject({
      alternates: { canonical: '/signs/no-crown-for-a-clown' },
      openGraph: { url: 'https://bestnokingsprotestsigns.org/signs/no-crown-for-a-clown' },
    })
  })

  it('shows useful current leader details on category pages', async () => {
    render(await CategoryPage({ params: Promise.resolve({ category: 'funny' }) }))

    const stat = screen.getByText('Current leader').closest('.topic-page__stat')

    expect(stat).not.toBeNull()

    const scoped = within(stat as HTMLElement)

    expect(scoped.getByText('No Crown for a Clown')).toBeInTheDocument()
    expect(scoped.getByText(/942 votes/i)).toBeInTheDocument()
    expect(scoped.queryByText('Funny')).not.toBeInTheDocument()
  })
})
