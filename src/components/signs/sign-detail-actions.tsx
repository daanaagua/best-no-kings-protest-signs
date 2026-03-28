'use client'

import { useState } from 'react'

type SignDetailActionsProps = {
  voteCount: number
  signTitle: string
  signSlogan: string
  shareUrl: string
}

function formatVoteCount(voteCount: number) {
  const label = voteCount === 1 ? 'vote' : 'votes'

  return `${voteCount.toLocaleString('en-US')} ${label}`
}

function buildShareHref(signTitle: string, signSlogan: string, shareUrl: string) {
  const text = `${signTitle} — ${signSlogan}`

  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`
}

export function SignDetailActions({
  voteCount,
  signTitle,
  signSlogan,
  shareUrl,
}: SignDetailActionsProps) {
  const [visibleVoteCount, setVisibleVoteCount] = useState(voteCount)
  const [hasVoted, setHasVoted] = useState(false)

  function handleVote() {
    if (hasVoted) {
      return
    }

    setVisibleVoteCount((currentCount) => currentCount + 1)
    setHasVoted(true)
  }

  return (
    <div className="sign-detail__actions-wrap">
      <span className="sign-card__badge sign-card__badge--pick">
        {formatVoteCount(visibleVoteCount)}
      </span>

      <div className="sign-detail__actions">
        <button
          aria-pressed={hasVoted}
          className="site-cta sign-detail__vote"
          disabled={hasVoted}
          onClick={handleVote}
          type="button"
        >
          {hasVoted ? 'Vote recorded' : 'Vote for this sign'}
        </button>

        <a
          className="home-hero__secondary sign-detail__share"
          href={buildShareHref(signTitle, signSlogan, shareUrl)}
          rel="noreferrer"
          target="_blank"
        >
          Share this sign
        </a>
      </div>
    </div>
  )
}
