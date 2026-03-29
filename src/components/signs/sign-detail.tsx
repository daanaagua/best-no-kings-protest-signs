import Image from 'next/image'

import { VoteButton } from '@/src/components/signs/vote-button'
import { SignWatermark } from '@/src/components/signs/sign-watermark'
import type { SignRecord } from '@/src/lib/signs/types'

type SignDetailProps = {
  sign: SignRecord
  shareUrl: string
}

function buildShareHref(signTitle: string, signSlogan: string, shareUrl: string) {
  const text = `${signTitle} — ${signSlogan}`

  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`
}

export function SignDetail({ sign, shareUrl }: SignDetailProps) {
  return (
    <article className="sign-detail">
      <div className="sign-detail__media">
        <Image
          alt={sign.title}
          fill
          priority
          sizes="(min-width: 1100px) 42rem, 100vw"
          src={sign.image}
          style={{ objectFit: 'contain', objectPosition: 'center' }}
        />
        <SignWatermark className="sign-watermark--media sign-watermark--detail" />
      </div>

      <div className="sign-detail__body">
        <div className="sign-detail__copy">
          <p className="sign-detail__eyebrow">No Kings protest sign</p>
          <h1 className="sign-detail__title">{sign.title}</h1>
          <p className="sign-detail__slogan">{sign.slogan}</p>
          <p className="sign-detail__description">{sign.description}</p>
        </div>

        <div className="sign-detail__actions-wrap">
          <VoteButton initialVoteCount={sign.voteCount} slug={sign.slug} />

          <div className="sign-detail__actions">
            <a
              className="home-hero__secondary sign-detail__share"
              href={buildShareHref(sign.title, sign.slogan, shareUrl)}
              rel="noreferrer"
              target="_blank"
            >
              Share this sign
            </a>
          </div>
        </div>

        <p className="sign-detail__note">
          {sign.sourceType === 'community'
            ? 'Approved community entries stay indexable here while the public submission flow remains in beta.'
            : 'Official signs anchor the launch gallery with full-size artwork built for marches, rallies, and sharing.'}
        </p>
      </div>
    </article>
  )
}
