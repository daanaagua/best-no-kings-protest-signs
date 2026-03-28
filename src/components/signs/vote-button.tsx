'use client'

import { useEffect, useState } from 'react'

import {
  formatVoteCount,
  hasRecordedVote,
  markVoteRecorded,
  submitVote,
} from '@/src/lib/signs/votes'

type VoteButtonProps = {
  slug: string
  initialVoteCount: number
}

export function VoteButton({ slug, initialVoteCount }: VoteButtonProps) {
  const [visibleVoteCount, setVisibleVoteCount] = useState(initialVoteCount)
  const [hasVoted, setHasVoted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    setHasVoted(hasRecordedVote(slug))
  }, [slug])

  async function handleVote() {
    if (hasVoted || isSubmitting) {
      return
    }

    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      const nextVoteCount = await submitVote(slug)

      setVisibleVoteCount(nextVoteCount)
      setHasVoted(true)
      markVoteRecorded(slug)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to record vote right now.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="sign-detail__actions-wrap">
      <span aria-live="polite" className="sign-card__badge sign-card__badge--pick">
        {formatVoteCount(visibleVoteCount)}
      </span>

      <div className="sign-detail__actions">
        <button
          aria-pressed={hasVoted}
          className="site-cta sign-detail__vote"
          disabled={hasVoted || isSubmitting}
          onClick={handleVote}
          type="button"
        >
          {hasVoted ? 'Vote recorded' : isSubmitting ? 'Recording vote...' : 'Vote for this sign'}
        </button>
      </div>

      {errorMessage ? (
        <p className="sign-detail__vote-status" role="status">
          {errorMessage}
        </p>
      ) : null}
    </div>
  )
}
