import { Hero } from '@/src/components/home/hero'
import { SignGrid } from '@/src/components/signs/sign-grid'
import { getAllSigns, getApprovedHomepageCommunitySigns } from '@/src/lib/signs/queries'
import { getEditorsPicks, getTrendingSigns } from '@/src/lib/signs/ranking'
import { SIGN_CATEGORIES } from '@/src/lib/signs/types'

export default function Home() {
  const allSigns = getAllSigns()
  const editorsPicks = getEditorsPicks(8)
  const communitySigns = getApprovedHomepageCommunitySigns(4)
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

      <SignGrid
        description="Community signs keep the wall grounded in local rally language, neighborhood humor, and downloadable poster ideas."
        eyebrow="Community additions"
        id="community-signs"
        signs={communitySigns}
        title="Recent community signs"
      />

      <section aria-labelledby="seo-copy-title" className="home-section seo-copy">
        <div className="section-heading">
          <p className="section-heading__eyebrow">Core intent</p>
          <h2 className="section-heading__title" id="seo-copy-title">
            What this No Kings sign wall is built for
          </h2>
        </div>

        <div className="seo-copy__body">
          <p>
            This homepage is built for people looking for No Kings protest signs that feel direct, readable, and serious enough to carry at a march without turning every card into a joke or a content bucket.
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
