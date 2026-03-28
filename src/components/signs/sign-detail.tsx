import Image from 'next/image'
import Link from 'next/link'

import { buildCategoryHref } from '@/src/components/home/category-rail'
import { VoteButton } from '@/src/components/signs/vote-button'
import type { SignCategory, SignRecord } from '@/src/lib/signs/types'

type SignDetailProps = {
  sign: SignRecord
  shareUrl: string
}

function formatCategoryLabel(category: SignCategory) {
  return category.charAt(0).toUpperCase() + category.slice(1)
}

function formatSourceLabel(sourceType: SignRecord['sourceType']) {
  return sourceType === 'community' ? 'Community' : 'Official release'
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
        />
      </div>

      <div className="sign-detail__body">
        <div className="sign-detail__badges">
          <span className="sign-card__badge sign-card__badge--source">
            {formatSourceLabel(sign.sourceType)}
          </span>
          {sign.editorsPick ? (
            <span className="sign-card__badge sign-card__badge--category">Editors pick</span>
          ) : null}
        </div>

        <div className="sign-detail__copy">
          <p className="sign-detail__eyebrow">No Kings sign detail</p>
          <h1 className="sign-detail__title">{sign.title}</h1>
          <p className="sign-detail__slogan">{sign.slogan}</p>
          <p className="sign-detail__description">{sign.description}</p>
        </div>

        <div className="sign-detail__categories">
          {sign.categories.map((category) => (
            <Link
              key={category}
              className="sign-detail__category-link"
              href={buildCategoryHref(category)}
            >
              {formatCategoryLabel(category)}
            </Link>
          ))}
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
            ? 'Approved community entries stay indexable here without opening the submission flow yet.'
            : 'Official release signs anchor the launch catalog with full-size artwork and reusable rally copy.'}
        </p>
      </div>
    </article>
  )
}
