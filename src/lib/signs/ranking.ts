import { getAllSigns, getSignsByCategory } from '@/src/lib/signs/queries'
import type { SignCategory, SignRecord } from '@/src/lib/signs/types'

const TRENDING_REFERENCE_DATE = new Date('2026-03-28T00:00:00.000Z')

function normalizeLimit(limit: number) {
  return limit > 0 ? Math.floor(limit) : 0
}

function compareByVoteCount(a: SignRecord, b: SignRecord) {
  const voteCountDiff = b.voteCount - a.voteCount

  if (voteCountDiff !== 0) {
    return voteCountDiff
  }

  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
}

function calculateTrendingScore(sign: SignRecord) {
  const ageInDays = Math.max(
    0,
    Math.floor(
      (TRENDING_REFERENCE_DATE.getTime() - new Date(sign.createdAt).getTime()) /
        (1000 * 60 * 60 * 24),
    ),
  )
  const freshnessScore = Math.max(0, 30 - ageInDays)
  const editorsPickBoost = sign.editorsPick ? 20 : 0

  return sign.voteCount * 0.55 + freshnessScore * 7 + editorsPickBoost
}

export function getEditorsPicks(limit: number) {
  const normalizedLimit = normalizeLimit(limit)

  return getAllSigns()
    .filter((sign) => sign.editorsPick === true)
    .sort(compareByVoteCount)
    .slice(0, normalizedLimit)
}

export function getTopAllTimeSigns(category: SignCategory, limit: number) {
  const normalizedLimit = normalizeLimit(limit)

  return getSignsByCategory(category)
    .sort(compareByVoteCount)
    .slice(0, normalizedLimit)
}

export function getTrendingSigns(category: SignCategory, limit: number) {
  const normalizedLimit = normalizeLimit(limit)

  return getSignsByCategory(category)
    .sort(
      (a, b) =>
        calculateTrendingScore(b) - calculateTrendingScore(a) ||
        compareByVoteCount(a, b),
    )
    .slice(0, normalizedLimit)
}
