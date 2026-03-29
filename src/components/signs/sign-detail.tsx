import Image from 'next/image'
import Link from 'next/link'

import { DownloadSignButton } from '@/src/components/signs/download-sign-button'
import { SignWatermark } from '@/src/components/signs/sign-watermark'
import { formatVoteCount } from '@/src/lib/signs/votes'
import type { SignRecord } from '@/src/lib/signs/types'

type SignDetailProps = {
  sign: SignRecord
  shareUrl: string
}

function buildShareHref(signTitle: string, signSlogan: string, shareUrl: string) {
  const text = `${signTitle} — ${signSlogan}`

  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`
}

function getPublicAttribution(sign: SignRecord) {
  if (sign.sourceType !== 'community' || !sign.submitterName) {
    return undefined
  }

  return `Submitted by ${sign.submitterName}`
}

export function SignDetail({ sign, shareUrl }: SignDetailProps) {
  const attribution = getPublicAttribution(sign)

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
          {attribution ? <p className="sign-detail__attribution">{attribution}</p> : null}
        </div>

        <div className="sign-detail__actions-wrap">
          <span aria-live="polite" className="sign-card__badge sign-card__badge--pick">
            {formatVoteCount(sign.voteCount)}
          </span>
          <div className="sign-detail__actions">
            <DownloadSignButton assetUrl={sign.image} title={sign.title} />
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
            ? 'Approved community entries stay indexable here alongside official boards, share links, and downloadable artwork.'
            : 'Official signs anchor the gallery with full-size artwork built for marches, rallies, downloading, and sharing.'}
        </p>
        <p className="sign-detail__note">
          <Link href="/">Browse all best No Kings protest signs</Link> if you want to move from this exact detail page back into the broader archive.
        </p>
      </div>
    </article>
  )
}
