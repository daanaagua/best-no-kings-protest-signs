'use client'

import { PUBLIC_VOTING_BETA_MESSAGE } from '@/src/lib/launch-mode'

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
  return (
    <div className="sign-detail__actions-wrap">
      <span className="sign-card__badge sign-card__badge--pick">
        {formatVoteCount(voteCount)}
      </span>

      <div className="sign-detail__actions">
        <button
          className="site-cta sign-detail__vote"
          disabled
          type="button"
        >
          Public voting opens after launch
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

      <p className="sign-detail__vote-status" role="status">
        {PUBLIC_VOTING_BETA_MESSAGE}
      </p>
    </div>
  )
}
