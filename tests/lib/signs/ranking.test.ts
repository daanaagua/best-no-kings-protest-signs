import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  getEditorsPicks,
  getTopAllTimeSigns,
  getTrendingSigns,
} from '@/src/lib/signs/ranking'

describe('ranking helpers', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns editors picks', () => {
    const picks = getEditorsPicks(4)

    expect(picks).toHaveLength(4)
    expect(picks.every((sign) => sign.editorsPick === true)).toBe(true)
  })

  it('returns top all-time signs sorted by voteCount', () => {
    const topFunnySigns = getTopAllTimeSigns('funny', 3)

    expect(topFunnySigns).toHaveLength(3)
    expect(topFunnySigns.every((sign) => sign.categories.includes('funny'))).toBe(
      true,
    )
    expect(topFunnySigns[0].voteCount).toBeGreaterThanOrEqual(
      topFunnySigns[1].voteCount,
    )
    expect(topFunnySigns[1].voteCount).toBeGreaterThanOrEqual(
      topFunnySigns[2].voteCount,
    )
  })

  it('returns trending signs using freshness and voteCount', () => {
    const trendingFunnySigns = getTrendingSigns('funny', 3)

    expect(trendingFunnySigns).toHaveLength(3)
    expect(trendingFunnySigns[0].slug).toBe('cardboard-not-crowns')
  })

  it('recomputes trending recency from the current time instead of a fixed launch date', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2030-03-28T00:00:00.000Z'))

    const trendingFunnySigns = getTrendingSigns('funny', 3)

    expect(trendingFunnySigns[0].slug).toBe('no-crown-for-a-clown')
  })

  it('returns no ranked signs when the requested limit is non-positive', () => {
    expect(getEditorsPicks(0)).toEqual([])
    expect(getTopAllTimeSigns('funny', -1)).toEqual([])
    expect(getTrendingSigns('funny', -1)).toEqual([])
  })
})
