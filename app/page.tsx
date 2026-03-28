import { buildCategoryHref, CategoryRail } from '@/src/components/home/category-rail'
import { Hero } from '@/src/components/home/hero'
import { SignGrid } from '@/src/components/signs/sign-grid'
import { getAllSigns, getApprovedHomepageCommunitySigns } from '@/src/lib/signs/queries'
import { getEditorsPicks, getTopAllTimeSigns, getTrendingSigns } from '@/src/lib/signs/ranking'
import { SIGN_CATEGORIES } from '@/src/lib/signs/types'

export const dynamic = 'force-dynamic'

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

  const categoryItems = SIGN_CATEGORIES.map((category) => ({
    category,
    count: allSigns.filter((sign) => sign.categories.includes(category)).length,
    highlight: getTopAllTimeSigns(category, 1)[0]?.title ?? 'Fresh picks landing now',
  }))

  return (
    <div className="home-page">
      <Hero
        communityCount={communityCount}
        featuredSign={editorsPicks[0] ?? allSigns[0]}
        printableCount={printableCount}
        totalSigns={allSigns.length}
      />

      <SignGrid
        description="The launch desk pulled the sharpest reads, strongest poster silhouettes, and most reusable chants from the initial collection."
        eyebrow="Curated by the launch desk"
        id="editorial-picks"
        signs={editorsPicks}
        title="Editorial picks for marches, megaphones, and fast print runs"
      />

      <CategoryRail items={categoryItems} />

      <SignGrid
        description="These signs are climbing on freshness, votes, and cross-category momentum from funny, best, kids, and printable lanes."
        eyebrow="Moving fast this week"
        id="trending-signs"
        signs={trendingSigns}
        title="Trending now across the homepage wall"
      />

      <SignGrid
        description="Approved uploads keep the collection grounded in neighborhood marches, school pickup lines, library-card wit, and local rally phrasing."
        eyebrow="Approved community uploads"
        id="community-signs"
        signs={communitySigns}
        title="Community ideas that earned a homepage slot"
      />

      <section aria-labelledby="seo-copy-title" className="home-section seo-copy">
        <div className="section-heading">
          <p className="section-heading__eyebrow">Search-friendly rally copy</p>
          <h2 className="section-heading__title" id="seo-copy-title">
            Why people search for No Kings protest signs here
          </h2>
        </div>

        <div className="seo-copy__body">
          <p>
            This homepage is built for people looking for the <a href={buildCategoryHref('best')}>best No Kings protest signs</a>, <a href={buildCategoryHref('funny')}>Funny No Kings signs</a>, printable slogans, and crowd-tested phrases that stay readable on poster board, phone screens, and social shares.
          </p>
          <p>
            Editorial picks surface the strongest all-around slogans, trending cards highlight what is climbing right now, and approved community uploads add local voice without losing the clear, poster-ready aesthetic established across the site shell.
          </p>
          <p>
            If you are comparing <a href={buildCategoryHref('printable')}>printable No Kings protest posters</a> or <a href={buildCategoryHref('kids')}>family-friendly sign ideas</a> for marches and rallies, the sections above give you a quick path into each lane without duplicating one-off homepage markup.
          </p>
        </div>
      </section>
    </div>
  )
}
