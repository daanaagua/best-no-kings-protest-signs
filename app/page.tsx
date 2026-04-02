import Link from 'next/link'

import { Hero } from '@/src/components/home/hero'
import { SignGrid } from '@/src/components/signs/sign-grid'
import {
  getAllSignsAsync,
  getApprovedHomepageCommunitySignsAsync,
} from '@/src/lib/signs/queries'
import { getEditorsPicks, getTrendingSigns } from '@/src/lib/signs/ranking'
import { SIGN_CATEGORIES } from '@/src/lib/signs/types'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const allSigns = await getAllSignsAsync()
  const editorsPicks = getEditorsPicks(8)
  const communitySigns = await getApprovedHomepageCommunitySignsAsync(4)
  const printableCount = allSigns.filter((sign) => sign.categories.includes('printable')).length
  const communityCount = allSigns.filter((sign) => sign.sourceType === 'community').length

  const trendingSigns = []
  const seenTrendingSlugs = new Set<string>()

  for (const category of SIGN_CATEGORIES) {
    for (const sign of getTrendingSigns(category, 2)) {
      if (seenTrendingSlugs.has(sign.slug)) {
        continue
      }

      seenTrendingSlugs.add(sign.slug)
      trendingSigns.push(sign)

      if (trendingSigns.length === 4) {
        break
      }
    }

    if (trendingSigns.length === 4) {
      break
    }
  }

  return (
    <div className="home-page">
      <Hero
        communityCount={communityCount}
        featuredSign={editorsPicks[0] ?? allSigns[0]}
        printableCount={printableCount}
        totalSigns={allSigns.length}
      />

      <section className="home-section home-update-callout" aria-labelledby="home-update-title">
        <div className="section-heading section-heading--compact">
          <p className="section-heading__eyebrow">Product update</p>
          <h2 className="section-heading__title" id="home-update-title">
            The sign maker now starts on a blank board
          </h2>
          <p className="section-heading__description">
            Read what changed in the editor, including blank-board defaults, ratio presets, image uploads, and freer text placement.
          </p>
        </div>

        <Link className="home-hero__secondary" href="/updates/blank-board-designer">
          Read the update
        </Link>
      </section>

      <SignGrid
        description="A tighter first pass of the strongest No Kings protest signs, rebuilt around cleaner boards, stronger wording, and a more serious rally tone."
        eyebrow="Featured now"
        id="editorial-picks"
        signs={editorsPicks}
        title="Featured No Kings protest signs"
      />

      <SignGrid
        description="A broader wall of signs for march prep, printing, and fast sharing without front-loading category labels into every decision."
        eyebrow="Browse the wall"
        id="trending-signs"
        signs={trendingSigns}
        title="More No Kings signs"
      />

      {communitySigns.length > 0 ? (
        <SignGrid
          description="Community signs keep the wall grounded in local rally language, shared tactics, and downloadable poster ideas."
          eyebrow="Community additions"
          id="community-signs"
          signs={communitySigns}
          title="Recent community signs"
        />
      ) : null}

      <section aria-labelledby="seo-copy-title" className="home-section seo-copy">
        <div className="section-heading">
          <p className="section-heading__eyebrow">Core intent</p>
          <h2 className="section-heading__title" id="seo-copy-title">
            What this No Kings sign wall is built for
          </h2>
        </div>

        <div className="seo-copy__body">
          <p>
            This homepage is built for people looking for No Kings protest signs that feel direct, readable, and serious enough to carry at a march without turning every card into a gimmick or a content bucket.
          </p>
          <p>
            Featured signs surface the strongest all-around lines, the wider wall gives you more phrases to browse, and approved community additions bring in local voice without cluttering the front page with unnecessary category labels.
          </p>
          <p>
            If you are making a sign for a march, rally, or printable handout, the goal here is simple: show clear language, let the words breathe, and keep the board itself focused on the message.
          </p>
        </div>
      </section>
    </div>
  )
}
