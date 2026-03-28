'use client'

import { PUBLIC_VOTING_BETA_MESSAGE } from '@/src/lib/launch-mode'
import { formatVoteCount } from '@/src/lib/signs/votes'

type VoteButtonProps = {
  slug: string
  initialVoteCount: number
}

export function VoteButton({ slug, initialVoteCount }: VoteButtonProps) {
  void slug

  return (
    <div className="sign-detail__actions-wrap">
      <span aria-live="polite" className="sign-card__badge sign-card__badge--pick">
        {formatVoteCount(initialVoteCount)}
      </span>

      <div className="sign-detail__actions">
        <button
          className="site-cta sign-detail__vote"
          disabled
          type="button"
        >
          Public voting opens after launch
        </button>
      </div>

      <p className="sign-detail__vote-status" role="status">
        {PUBLIC_VOTING_BETA_MESSAGE}
      </p>
    </div>
  )
}
