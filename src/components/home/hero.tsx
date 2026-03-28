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
        <p className="home-hero__eyebrow">Poster-bright protest ideas for the no-kings crowd</p>
        <h1 className="home-hero__title">Find the sharpest No Kings protest signs for march day, print day, and share day.</h1>
        <p className="home-hero__description">
          Browse a launch-ready wall of funny slogans, printable lines, kids-safe chants, and approved community uploads built to read clearly from sidewalks to social crops.
        </p>

        <div className="home-hero__actions">
          <Link className="site-cta" href="#editorial-picks">
            Browse editorial picks
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
          <p className="home-hero__feature-kicker">Featured pick</p>
          <p className="home-hero__feature-note">A crowd-tested sign from the homepage launch stack.</p>
        </div>
        <SignCard sign={featuredSign} />
      </div>
    </section>
  )
}
