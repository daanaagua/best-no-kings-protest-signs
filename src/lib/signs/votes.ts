const VOTE_STORAGE_PREFIX = 'site-mvp:voted-sign:'

export function buildVoteStorageKey(slug: string) {
  return `${VOTE_STORAGE_PREFIX}${slug}`
}

export function formatVoteCount(voteCount: number) {
  const label = voteCount === 1 ? 'vote' : 'votes'

  return `${voteCount.toLocaleString('en-US')} ${label}`
}

function canUseLocalStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

export function hasRecordedVote(slug: string) {
  if (!canUseLocalStorage()) {
    return false
  }

  return window.localStorage.getItem(buildVoteStorageKey(slug)) === '1'
}

export function markVoteRecorded(slug: string) {
  if (!canUseLocalStorage()) {
    return
  }

  window.localStorage.setItem(buildVoteStorageKey(slug), '1')
}

export async function submitVote(slug: string) {
  const response = await fetch('/api/votes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ slug }),
  })

  const payload = (await response.json()) as { error?: string; voteCount?: number }

  if (!response.ok || typeof payload.voteCount !== 'number') {
    throw new Error(payload.error ?? 'Unable to record vote right now.')
  }

  return payload.voteCount
}
