import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  getCategoryEditorsPicks,
  getEditorsPicks,
  getTopAllTimeSigns,
  getTrendingSigns,
} from '@/src/lib/signs/ranking'
import { SIGN_CATEGORIES } from '@/src/lib/signs/types'

describe('ranking helpers', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('keeps ranking helpers aligned to the public categories', () => {
    expect(SIGN_CATEGORIES).toEqual(['best', 'kids', 'printable'])
    expect(SIGN_CATEGORIES).not.toContain('funny')
  })

  it('returns editors picks', () => {
    const picks = getEditorsPicks(4)

    expect(picks).toHaveLength(4)
    expect(picks.every((sign) => sign.editorsPick === true)).toBe(true)
  })

  it('returns editors picks scoped to a category', () => {
    const picks = getCategoryEditorsPicks('best', 3)
    const reassignedPick = picks.find(
      (sign) => sign.slug === 'no-crown-for-a-clown',
    )

    expect(picks).toHaveLength(3)
    expect(picks.every((sign) => sign.editorsPick === true)).toBe(true)
    expect(picks.every((sign) => sign.categories.includes('best'))).toBe(true)
    expect(reassignedPick).toMatchObject({
      primaryCategory: 'best',
      categories: ['best'],
    })
  })

  it('returns top all-time signs sorted by voteCount', () => {
    const topBestSigns = getTopAllTimeSigns('best', 3)

    expect(topBestSigns).toHaveLength(3)
    expect(topBestSigns.every((sign) => sign.categories.includes('best'))).toBe(true)
    expect(topBestSigns[0].voteCount).toBeGreaterThanOrEqual(topBestSigns[1].voteCount)
    expect(topBestSigns[1].voteCount).toBeGreaterThanOrEqual(topBestSigns[2].voteCount)
  })

  it('keeps ranking helpers scoped to official signs only', () => {
    const rankedSigns = [
      ...getEditorsPicks(20),
      ...getCategoryEditorsPicks('best', 20),
      ...getTopAllTimeSigns('best', 100),
      ...getTrendingSigns('best', 100),
    ]

    expect(rankedSigns.length).toBeGreaterThan(0)
    expect(rankedSigns.every((sign) => sign.sourceType === 'official')).toBe(true)
    expect(rankedSigns.some((sign) => sign.slug.startsWith('community-'))).toBe(false)
  })

  it('keeps reassigned kids signs rankable without funny tags', () => {
    const topKidsSigns = getTopAllTimeSigns('kids', 4)
    const crayons = topKidsSigns.find((sign) => sign.slug === 'crayons-not-crowns')
    const stillNoKing = topKidsSigns.find(
      (sign) => sign.slug === 'no-king-just-kidding-still-no-king',
    )

    expect(topKidsSigns).toHaveLength(4)
    expect(topKidsSigns.map((sign) => sign.slug)).toEqual(
      expect.arrayContaining([
        'crayons-not-crowns',
        'no-king-just-kidding-still-no-king',
        'little-hands-big-no-kings',
      ]),
    )
    expect(crayons).toMatchObject({
      primaryCategory: 'kids',
      categories: ['kids', 'printable'],
    })
    expect(stillNoKing).toMatchObject({
      primaryCategory: 'kids',
      categories: ['kids'],
    })
  })

  it('returns trending signs using freshness and voteCount', () => {
    const trendingBestSigns = getTrendingSigns('best', 3)

    expect(trendingBestSigns).toHaveLength(3)
    expect(trendingBestSigns[0].slug).toBe('poster-ready-power-to-people')
  })

  it('recomputes trending recency from the current time instead of a fixed launch date', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2030-03-28T00:00:00.000Z'))

    const trendingBestSigns = getTrendingSigns('best', 3)

    expect(trendingBestSigns[0].slug).toBe('no-crown-for-a-clown')
  })

  it('returns no ranked signs when the requested limit is non-positive', () => {
    expect(getEditorsPicks(0)).toEqual([])
    expect(getTopAllTimeSigns('best', -1)).toEqual([])
    expect(getTrendingSigns('best', -1)).toEqual([])
  })
})
