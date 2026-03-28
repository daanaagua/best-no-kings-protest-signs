import Image from 'next/image'
import Link from 'next/link'

import type { SignRecord } from '@/src/lib/signs/types'

type SignCardProps = {
  sign: SignRecord
}

function formatVoteCount(voteCount: number) {
  const label = voteCount === 1 ? 'vote' : 'votes'

  return `${voteCount.toLocaleString('en-US')} ${label}`
}

export function SignCard({ sign }: SignCardProps) {
  return (
    <article className="sign-card">
      <div className="sign-card__media">
        <Image
          alt={sign.title}
          fill
          sizes="(min-width: 1200px) 24rem, (min-width: 768px) 33vw, 100vw"
          src={sign.image}
          style={{ objectFit: 'contain', objectPosition: 'center' }}
        />
      </div>

      <div className="sign-card__body">
        <div className="sign-card__copy">
          <h3 className="sign-card__title">{sign.title}</h3>
          <p className="sign-card__slogan">{sign.slogan}</p>
          <p className="sign-card__description">{sign.description}</p>
        </div>

        <div className="sign-card__footer">
          <span className="sign-card__votes">{formatVoteCount(sign.voteCount)}</span>
          <Link className="sign-card__link" href={`/signs/${sign.slug}`}>
            View sign
          </Link>
        </div>
      </div>
    </article>
  )
}
