import { afterEach, describe, expect, it, vi } from 'vitest'

import { officialLaunchSigns } from '@/src/data/signs'
import {
  getAllSigns,
  getApprovedHomepageCommunitySigns,
  getRecentApprovedCommunitySigns,
  getSignBySlug,
  getSignsByCategory,
} from '@/src/lib/signs/queries'
import { SIGN_CATEGORIES } from '@/src/lib/signs/types'

afterEach(() => {
  vi.resetModules()
  vi.doUnmock('@/src/lib/submissions/store')
  vi.doUnmock('@/src/lib/runtime-mode')
  vi.unstubAllEnvs()
})

describe('public sign queries', () => {
  it('exposes only the current public sign categories', () => {
    expect(SIGN_CATEGORIES).toEqual(['best', 'kids', 'printable'])
    expect(SIGN_CATEGORIES).not.toContain('funny')
  })

  it('returns only official launch signs when no submissions have been approved yet', () => {
    const signs = getAllSigns()

    expect(signs).toHaveLength(officialLaunchSigns.length)
    expect(signs.every((sign) => sign.sourceType === 'official')).toBe(true)
    expect(signs.some((sign) => sign.slug.startsWith('community-'))).toBe(false)
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

  it('returns no approved community signs until a real submission is approved', () => {
    expect(getApprovedHomepageCommunitySigns(6)).toEqual([])
    expect(getRecentApprovedCommunitySigns(6)).toEqual([])
  })

  it('adds real approved submissions to public reads without reviving legacy seeded community signs', async () => {
    vi.resetModules()
    vi.stubEnv('ENABLE_COMMUNITY_MVP', 'true')
    vi.doMock('@/src/lib/submissions/store', async () => {
      const actual = await vi.importActual<typeof import('@/src/lib/submissions/store')>(
        '@/src/lib/submissions/store',
      )

      return {
        ...actual,
        listApprovedSubmissionsSync: () => [
          {
            id: 'submission-real-approved',
            slogan: 'Town Hall Over Throne Room',
            slugCandidate: 'town-hall-over-throne-room',
            selectedTemplate: 'classic',
            primaryCategory: 'best',
            categories: ['best', 'printable'],
            status: 'approved',
            createdAt: '2026-03-29T10:30:00.000Z',
            approvedAt: '2026-03-29T12:00:00.000Z',
            textRotation: 0,
            textOffsetY: 0,
            textScale: 1,
          },
        ],
        getStoredVotesSnapshotSync: () => ({
          'town-hall-over-throne-room': 12,
        }),
      }
    })

    const { getAllSigns: getAll, getSignBySlug: getBySlug, getSignsByCategory: getByCategory } =
      await import('@/src/lib/signs/queries')

    expect(getAll().some((sign) => sign.slug === 'town-hall-over-throne-room')).toBe(true)
    expect(getAll().some((sign) => sign.slug === 'community-library-cards-over-crowns')).toBe(false)
    expect(getBySlug('town-hall-over-throne-room')).toMatchObject({
      slug: 'town-hall-over-throne-room',
      sourceType: 'community',
      categories: ['best', 'printable'],
    })
    expect(getBySlug('community-library-cards-over-crowns')).toBeUndefined()
    expect(getByCategory('best').some((sign) => sign.slug === 'town-hall-over-throne-room')).toBe(
      true,
    )
    expect(
      getByCategory('best').some((sign) => sign.slug === 'community-library-cards-over-crowns'),
    ).toBe(false)
  })

  it('does not suppress real approved submissions when the legacy-seed runtime flag is enabled', async () => {
    vi.resetModules()
    vi.doMock('@/src/lib/runtime-mode', () => ({
      shouldIncludeApprovedSubmissionSignsInPublicQueries: () => true,
      shouldIncludeLegacySeededCommunitySignsInPublicQueries: () => true,
    }))
    vi.doMock('@/src/lib/submissions/store', async () => {
      const actual = await vi.importActual<typeof import('@/src/lib/submissions/store')>(
        '@/src/lib/submissions/store',
      )

      return {
        ...actual,
        listApprovedSubmissionsSync: () => [
          {
            id: 'submission-flag-check',
            slogan: 'Flag check',
            slugCandidate: 'flag-check',
            selectedTemplate: 'classic',
            primaryCategory: 'best',
            categories: ['best'],
            status: 'approved',
            createdAt: '2026-03-29T10:30:00.000Z',
            approvedAt: '2026-03-29T12:00:00.000Z',
            textRotation: 0,
            textOffsetY: 0,
            textScale: 1,
          },
        ],
        getStoredVotesSnapshotSync: () => ({
          'flag-check': 1,
        }),
      }
    })

    const { getAllSigns: getAll } = await import('@/src/lib/signs/queries')

    expect(getAll().some((sign) => sign.slug === 'flag-check')).toBe(true)
    expect(getAll().some((sign) => sign.slug === 'community-library-cards-over-crowns')).toBe(false)
  })

  it('keeps approved submissions out of public queries when community MVP mode is disabled', async () => {
    vi.resetModules()
    vi.stubEnv('ENABLE_COMMUNITY_MVP', 'false')
    vi.doMock('@/src/lib/submissions/store', async () => {
      const actual = await vi.importActual<typeof import('@/src/lib/submissions/store')>(
        '@/src/lib/submissions/store',
      )

      return {
        ...actual,
        listApprovedSubmissionsSync: () => [
          {
            id: 'submission-hidden-when-disabled',
            slogan: 'Hidden when disabled',
            slugCandidate: 'hidden-when-disabled',
            selectedTemplate: 'classic',
            primaryCategory: 'best',
            categories: ['best'],
            status: 'approved',
            createdAt: '2026-03-29T10:30:00.000Z',
            approvedAt: '2026-03-29T12:00:00.000Z',
            textRotation: 0,
            textOffsetY: 0,
            textScale: 1,
          },
        ],
        getStoredVotesSnapshotSync: () => ({
          'hidden-when-disabled': 5,
        }),
      }
    })

    const { getAllSigns: getAll, getSignBySlug: getBySlug } = await import('@/src/lib/signs/queries')

    expect(getAll().some((sign) => sign.slug === 'hidden-when-disabled')).toBe(false)
    expect(getBySlug('hidden-when-disabled')).toBeUndefined()
  })

  it('returns no homepage community signs when the requested limit is non-positive', () => {
    expect(getApprovedHomepageCommunitySigns(0)).toEqual([])
    expect(getApprovedHomepageCommunitySigns(-1)).toEqual([])
  })

  it('sorts recent approved community signs by approvedAt, createdAt, and id', async () => {
    vi.resetModules()
    vi.stubEnv('ENABLE_COMMUNITY_MVP', 'true')
    vi.doMock('@/src/lib/submissions/store', async () => {
      const actual = await vi.importActual<typeof import('@/src/lib/submissions/store')>(
        '@/src/lib/submissions/store',
      )

      return {
        ...actual,
        listApprovedSubmissionsSync: () => [
          {
            id: 'submission-z',
            slogan: 'Latest approval wins first',
            slugCandidate: 'latest-approval-wins-first',
            selectedTemplate: 'classic',
            primaryCategory: 'best',
            categories: ['best'],
            status: 'approved',
            createdAt: '2026-03-25T12:00:00.000Z',
            approvedAt: '2026-03-29T09:00:00.000Z',
            textRotation: 0,
            textOffsetY: 0,
            textScale: 1,
          },
          {
            id: 'submission-a',
            slogan: 'Newer created breaks approved tie',
            slugCandidate: 'newer-created-breaks-approved-tie',
            selectedTemplate: 'classic',
            primaryCategory: 'best',
            categories: ['best'],
            status: 'approved',
            createdAt: '2026-03-27T12:00:00.000Z',
            approvedAt: '2026-03-28T09:00:00.000Z',
            textRotation: 0,
            textOffsetY: 0,
            textScale: 1,
          },
          {
            id: 'submission-c',
            slogan: 'Higher id breaks full tie',
            slugCandidate: 'higher-id-breaks-full-tie',
            selectedTemplate: 'classic',
            primaryCategory: 'best',
            categories: ['best'],
            status: 'approved',
            createdAt: '2026-03-26T12:00:00.000Z',
            approvedAt: '2026-03-28T09:00:00.000Z',
            textRotation: 0,
            textOffsetY: 0,
            textScale: 1,
          },
          {
            id: 'submission-b',
            slogan: 'Lower id loses full tie',
            slugCandidate: 'lower-id-loses-full-tie',
            selectedTemplate: 'classic',
            primaryCategory: 'best',
            categories: ['best'],
            status: 'approved',
            createdAt: '2026-03-26T12:00:00.000Z',
            approvedAt: '2026-03-28T09:00:00.000Z',
            textRotation: 0,
            textOffsetY: 0,
            textScale: 1,
          },
          {
            id: 'submission-d',
            slogan: 'Older approval',
            slugCandidate: 'older-approval',
            selectedTemplate: 'classic',
            primaryCategory: 'best',
            categories: ['best'],
            status: 'approved',
            createdAt: '2026-03-28T12:00:00.000Z',
            approvedAt: '2026-03-27T09:00:00.000Z',
            textRotation: 0,
            textOffsetY: 0,
            textScale: 1,
          },
        ],
        getStoredVotesSnapshotSync: () => ({
          'latest-approval-wins-first': 2,
          'newer-created-breaks-approved-tie': 3,
          'higher-id-breaks-full-tie': 4,
          'lower-id-loses-full-tie': 5,
          'older-approval': 5,
        }),
      }
    })

    const { getRecentApprovedCommunitySigns: getRecentSigns } = await import(
      '@/src/lib/signs/queries'
    )

    expect(getRecentSigns(4).map((sign) => sign.slug)).toEqual([
      'latest-approval-wins-first',
      'newer-created-breaks-approved-tie',
      'higher-id-breaks-full-tie',
      'lower-id-loses-full-tie',
    ])
    expect(getRecentSigns(5).map((sign) => sign.slug)).toEqual([
      'latest-approval-wins-first',
      'newer-created-breaks-approved-tie',
      'higher-id-breaks-full-tie',
      'lower-id-loses-full-tie',
      'older-approval',
    ])
  })

  it('returns approved community signs from the async public query helpers', async () => {
    vi.resetModules()
    vi.stubEnv('ENABLE_COMMUNITY_MVP', 'true')
    vi.doMock('@/src/lib/submissions/store', async () => {
      const actual = await vi.importActual<typeof import('@/src/lib/submissions/store')>(
        '@/src/lib/submissions/store',
      )

      return {
        ...actual,
        listApprovedSubmissions: async () => [
          {
            id: 'submission-async-approved',
            slogan: 'Town Hall Over Throne Room',
            slugCandidate: 'town-hall-over-throne-room',
            selectedTemplate: 'classic',
            primaryCategory: 'best',
            categories: ['best', 'printable'],
            status: 'approved',
            createdAt: '2026-03-29T10:30:00.000Z',
            approvedAt: '2026-03-29T12:00:00.000Z',
            textRotation: 0,
            textOffsetY: 0,
            textScale: 1,
          },
        ],
        getStoredVotesSnapshot: async () => ({
          'town-hall-over-throne-room': 12,
        }),
      }
    })

    const {
      getAllSignsAsync,
      getApprovedHomepageCommunitySignsAsync,
      getRecentApprovedCommunitySignsAsync,
      getRelatedSignsAsync,
      getSignBySlugAsync,
      getSignsByCategoryAsync,
    } = await import('@/src/lib/signs/queries')

    expect(
      (await getAllSignsAsync()).some((sign) => sign.slug === 'town-hall-over-throne-room'),
    ).toBe(true)
    expect(await getSignBySlugAsync('town-hall-over-throne-room')).toMatchObject({
      slug: 'town-hall-over-throne-room',
      sourceType: 'community',
      voteCount: 12,
    })
    expect(
      (await getSignsByCategoryAsync('best')).some(
        (sign) => sign.slug === 'town-hall-over-throne-room',
      ),
    ).toBe(true)
    expect(await getApprovedHomepageCommunitySignsAsync(4)).toMatchObject([
      {
        slug: 'town-hall-over-throne-room',
      },
    ])
    expect(await getRecentApprovedCommunitySignsAsync(4)).toMatchObject([
      {
        slug: 'town-hall-over-throne-room',
      },
    ])
    expect(
      (await getRelatedSignsAsync('no-crown-for-a-clown', 'best', 20)).some(
        (sign) => sign.slug === 'town-hall-over-throne-room',
      ),
    ).toBe(true)
  })
})
