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
})
