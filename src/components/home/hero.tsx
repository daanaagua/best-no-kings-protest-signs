import Link from 'next/link'

import { SignCard } from '@/src/components/signs/sign-card'
import { siteConfig } from '@/src/data/site'
import type { SignRecord } from '@/src/lib/signs/types'

type HeroProps = {
  featuredSign: SignRecord
  totalSigns: number
  communityCount: number
  printableCount: number
}

export function Hero({ featuredSign, totalSigns, communityCount, printableCount }: HeroProps) {
  return (
    <section className="home-hero">
      <div className="home-hero__copy">
        <p className="home-hero__eyebrow">Best no-kings sign ideas for real rally use</p>
        <h1 className="home-hero__title">Best No Kings protest signs built to read clearly at marches, rallies, and on the street.</h1>
        <p className="home-hero__description">
          Browse a clean wall of No Kings protest signs with stronger lettering, tighter line breaks, and a more serious protest look. Every sign is designed to stay legible without extra clutter inside the board.
        </p>

        <div className="home-hero__actions">
          <Link className="site-cta" href="#editorial-picks">
            Browse the sign wall
          </Link>
          <Link className="home-hero__secondary" href={siteConfig.primaryAction.href}>
            {siteConfig.primaryAction.label}
          </Link>
        </div>

        <dl className="home-hero__stats">
          <div className="home-hero__stat">
            <dt>Launch-ready signs</dt>
            <dd>{totalSigns}</dd>
          </div>
          <div className="home-hero__stat">
            <dt>Approved community ideas</dt>
            <dd>{communityCount}</dd>
          </div>
          <div className="home-hero__stat">
            <dt>Printable-first posters</dt>
            <dd>{printableCount}</dd>
          </div>
        </dl>
      </div>

        <div className="home-hero__feature">
          <div className="home-hero__feature-header">
          <p className="home-hero__feature-kicker">Featured sign</p>
          <p className="home-hero__feature-note">A launch-ready sign from the current No Kings wall.</p>
          </div>
          <SignCard sign={featuredSign} />
        </div>
    </section>
  )
}
