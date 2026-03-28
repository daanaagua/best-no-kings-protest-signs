import { describe, expect, it } from 'vitest'

import {
  getAllSigns,
  getApprovedHomepageCommunitySigns,
  getSignBySlug,
  getSignsByCategory,
} from '@/src/lib/signs/queries'

describe('public sign queries', () => {
  it('returns the unified launch feed with official and community signs', () => {
    const signs = getAllSigns()

    expect(signs.length).toBeGreaterThanOrEqual(56)
    expect(signs.some((sign) => sign.sourceType === 'official')).toBe(true)
    expect(signs.some((sign) => sign.sourceType === 'community')).toBe(true)
  })

  it('returns a sign by slug', () => {
    expect(getSignBySlug('no-crown-for-a-clown')?.slug).toBe(
      'no-crown-for-a-clown',
    )
  })

  it('returns defensive copies so one lookup cannot mutate later query results', () => {
    const sign = getSignBySlug('no-crown-for-a-clown')

    expect(sign).toBeDefined()

    sign!.title = 'Tampered title'
    sign!.categories.push('kids')

    expect(getSignBySlug('no-crown-for-a-clown')?.title).toBe(
      'No Crown for a Clown',
    )
    expect(
      getSignsByCategory('kids').some(
        (result) => result.slug === 'no-crown-for-a-clown',
      ),
    ).toBe(false)
  })

  it('returns category matches using category tags', () => {
    const funnySigns = getSignsByCategory('funny')

    expect(funnySigns.length).toBeGreaterThanOrEqual(12)
    expect(funnySigns.every((sign) => sign.categories.includes('funny'))).toBe(
      true,
    )
  })

  it('returns approved community signs for the homepage feed', () => {
    const homepageSigns = getApprovedHomepageCommunitySigns(6)

    expect(homepageSigns).toHaveLength(6)
    expect(homepageSigns.every((sign) => sign.sourceType === 'community')).toBe(
      true,
    )
  })

  it('returns no homepage community signs when the requested limit is non-positive', () => {
    expect(getApprovedHomepageCommunitySigns(0)).toEqual([])
    expect(getApprovedHomepageCommunitySigns(-1)).toEqual([])
  })
})
