import { launchSigns } from '@/src/data/signs'
import type { SignCategory, SignRecord } from '@/src/lib/signs/types'

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
  return [...signs].sort(compareSignsByRecency)
}

export function getAllSigns() {
  return sortSigns(launchSigns)
}

export function getSignBySlug(slug: string) {
  return launchSigns.find((sign) => sign.slug === slug)
}

export function getSignsByCategory(category: SignCategory) {
  return getAllSigns().filter((sign) => sign.categories.includes(category))
}

export function getApprovedHomepageCommunitySigns(limit: number) {
  return getAllSigns()
    .filter((sign) => sign.sourceType === 'community')
    .slice(0, limit)
}
