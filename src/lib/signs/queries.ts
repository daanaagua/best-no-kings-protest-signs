import { launchSigns } from '@/src/data/signs'
import type { SignCategory, SignRecord } from '@/src/lib/signs/types'

function cloneSign(sign: SignRecord): SignRecord {
  return {
    ...sign,
    categories: [...sign.categories],
  }
}

function normalizeLimit(limit: number) {
  return limit > 0 ? Math.floor(limit) : 0
}

function compareSignsByRecency(a: SignRecord, b: SignRecord) {
  const createdAtDiff =
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()

  if (createdAtDiff !== 0) {
    return createdAtDiff
  }

  const voteCountDiff = b.voteCount - a.voteCount

  if (voteCountDiff !== 0) {
    return voteCountDiff
  }

  return a.title.localeCompare(b.title)
}

function sortSigns(signs: SignRecord[]) {
  return [...signs].sort(compareSignsByRecency).map(cloneSign)
}

function countSharedCategories(a: SignRecord, b: SignRecord) {
  return a.categories.filter((category) => b.categories.includes(category)).length
}

export function getAllSigns() {
  return sortSigns(launchSigns)
}

export function getSignBySlug(slug: string) {
  const sign = launchSigns.find((result) => result.slug === slug)

  return sign ? cloneSign(sign) : undefined
}

export function getSignsByCategory(category: SignCategory) {
  return getAllSigns().filter((sign) => sign.categories.includes(category))
}

export function getApprovedHomepageCommunitySigns(limit: number) {
  const normalizedLimit = normalizeLimit(limit)

  return getAllSigns()
    .filter((sign) => sign.sourceType === 'community')
    .slice(0, normalizedLimit)
}

export function getRelatedSigns(
  currentSlug: string,
  category: SignCategory,
  limit: number,
) {
  const normalizedLimit = normalizeLimit(limit)

  if (normalizedLimit === 0) {
    return []
  }

  const currentSign = getSignBySlug(currentSlug)

  if (!currentSign) {
    return []
  }

  return getSignsByCategory(category)
    .filter((sign) => sign.slug !== currentSlug)
    .sort((a, b) => {
      const sharedCategoryDiff =
        countSharedCategories(b, currentSign) - countSharedCategories(a, currentSign)

      if (sharedCategoryDiff !== 0) {
        return sharedCategoryDiff
      }

      return compareSignsByRecency(a, b)
    })
    .slice(0, normalizedLimit)
}
