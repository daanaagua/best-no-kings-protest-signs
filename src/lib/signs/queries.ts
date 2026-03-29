import { cache } from 'react'

import { getOfficialSigns as getOfficialSignSeedData } from '@/src/data/signs'
import { shouldIncludeApprovedSubmissionSignsInPublicQueries } from '@/src/lib/runtime-mode'
import {
  buildApprovedSubmissionSign,
  getStoredVotesSnapshot,
  getStoredVotesSnapshotSync,
  listApprovedSubmissions,
  listApprovedSubmissionsSync,
} from '@/src/lib/submissions/store'
import type { SubmissionRecord } from '@/src/lib/submissions/store'
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

function compareApprovedSubmissionsByRecency(
  a: SubmissionRecord,
  b: SubmissionRecord,
) {
  const approvedAtDiff =
    new Date(b.approvedAt ?? 0).getTime() - new Date(a.approvedAt ?? 0).getTime()

  if (approvedAtDiff !== 0) {
    return approvedAtDiff
  }

  const createdAtDiff =
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()

  if (createdAtDiff !== 0) {
    return createdAtDiff
  }

  return b.id.localeCompare(a.id)
}

function getRuntimeCommunitySigns() {
  if (!shouldIncludeApprovedSubmissionSignsInPublicQueries()) {
    return []
  }

  const votes = getStoredVotesSnapshotSync()

  return listApprovedSubmissionsSync()
    .sort(compareApprovedSubmissionsByRecency)
    .map((submission) =>
      buildApprovedSubmissionSign(submission, votes[submission.slugCandidate] ?? 0),
    )
}

const getRuntimeCommunitySignsAsync = cache(async function getRuntimeCommunitySignsAsync() {
  if (!shouldIncludeApprovedSubmissionSignsInPublicQueries()) {
    return []
  }

  const [votes, submissions] = await Promise.all([
    getStoredVotesSnapshot(),
    listApprovedSubmissions(),
  ])

  return submissions
    .sort(compareApprovedSubmissionsByRecency)
    .map((submission) =>
      buildApprovedSubmissionSign(submission, votes[submission.slugCandidate] ?? 0),
    )
})

function getMergedPublicSigns() {
  return [...getOfficialSignSeedData(), ...getRuntimeCommunitySigns()].map(cloneSign)
}

const getMergedPublicSignsAsync = cache(async function getMergedPublicSignsAsync() {
  return [...getOfficialSignSeedData(), ...(await getRuntimeCommunitySignsAsync())].map(cloneSign)
})

function countSharedCategories(a: SignRecord, b: SignRecord) {
  return a.categories.filter((category) => b.categories.includes(category)).length
}

export function getAllSigns() {
  return sortSigns(getMergedPublicSigns())
}

export function getOfficialSigns() {
  return sortSigns(getOfficialSignSeedData())
}

export async function getAllSignsAsync() {
  return sortSigns(await getMergedPublicSignsAsync())
}

export function getSignBySlug(slug: string) {
  const sign = getMergedPublicSigns().find((result) => result.slug === slug)

  return sign ? cloneSign(sign) : undefined
}

export async function getSignBySlugAsync(slug: string) {
  const sign = (await getMergedPublicSignsAsync()).find((result) => result.slug === slug)

  return sign ? cloneSign(sign) : undefined
}

export function getSignsByCategory(category: SignCategory) {
  return getAllSigns().filter((sign) => sign.categories.includes(category))
}

export async function getSignsByCategoryAsync(category: SignCategory) {
  return (await getAllSignsAsync()).filter((sign) => sign.categories.includes(category))
}

export function getOfficialSignsByCategory(category: SignCategory) {
  return getOfficialSigns().filter((sign) => sign.categories.includes(category))
}

export function getApprovedHomepageCommunitySigns(limit: number) {
  return getRecentApprovedCommunitySigns(limit)
}

export async function getApprovedHomepageCommunitySignsAsync(limit: number) {
  return getRecentApprovedCommunitySignsAsync(limit)
}

export function getRecentApprovedCommunitySigns(limit: number) {
  const normalizedLimit = normalizeLimit(limit)

  return getRuntimeCommunitySigns().slice(0, normalizedLimit).map(cloneSign)
}

export async function getRecentApprovedCommunitySignsAsync(limit: number) {
  const normalizedLimit = normalizeLimit(limit)

  return (await getRuntimeCommunitySignsAsync()).slice(0, normalizedLimit).map(cloneSign)
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

export async function getRelatedSignsAsync(
  currentSlug: string,
  category: SignCategory,
  limit: number,
) {
  const normalizedLimit = normalizeLimit(limit)

  if (normalizedLimit === 0) {
    return []
  }

  const currentSign = await getSignBySlugAsync(currentSlug)

  if (!currentSign) {
    return []
  }

  return (await getSignsByCategoryAsync(category))
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
