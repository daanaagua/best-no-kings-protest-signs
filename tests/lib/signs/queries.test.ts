import { describe, expect, it } from 'vitest'

import {
  getAllSigns,
  getApprovedHomepageCommunitySigns,
  getSignBySlug,
  getSignsByCategory,
} from '@/src/lib/signs/queries'
import { SIGN_CATEGORIES } from '@/src/lib/signs/types'

describe('public sign queries', () => {
  it('exposes only the current public sign categories', () => {
    expect(SIGN_CATEGORIES).toEqual(['best', 'kids', 'printable'])
    expect(SIGN_CATEGORIES).not.toContain('funny')
  })

  it('returns the unified launch feed with official and community signs', () => {
    const signs = getAllSigns()

    expect(signs.length).toBeGreaterThanOrEqual(56)
    expect(signs.some((sign) => sign.sourceType === 'official')).toBe(true)
    expect(signs.some((sign) => sign.sourceType === 'community')).toBe(true)
  })

  it('returns a sign by slug', () => {
    const sign = getSignBySlug('no-crown-for-a-clown')

    expect(sign?.slug).toBe('no-crown-for-a-clown')
    expect(sign?.primaryCategory).toBe('best')
    expect(sign?.categories).toEqual(['best'])
  })

  it('reassigns former funny signs into surviving public categories', () => {
    expect(getSignBySlug('cardboard-not-crowns')).toMatchObject({
      primaryCategory: 'printable',
      categories: ['printable'],
    })
    expect(getSignBySlug('no-king-just-kidding-still-no-king')).toMatchObject({
      primaryCategory: 'kids',
      categories: ['kids'],
    })

    expect(
      getSignsByCategory('printable').some(
        (sign) => sign.slug === 'cardboard-not-crowns',
      ),
    ).toBe(true)
    expect(
      getSignsByCategory('kids').some(
        (sign) => sign.slug === 'no-king-just-kidding-still-no-king',
      ),
    ).toBe(true)
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
    const bestSigns = getSignsByCategory('best')

    expect(bestSigns.length).toBeGreaterThanOrEqual(12)
    expect(bestSigns.every((sign) => sign.categories.includes('best'))).toBe(true)
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
