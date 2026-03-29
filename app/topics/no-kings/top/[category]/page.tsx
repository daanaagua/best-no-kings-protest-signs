import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { buildCategoryHref } from '@/src/components/home/category-rail'
import { SignGrid } from '@/src/components/signs/sign-grid'
import { siteConfig } from '@/src/data/site'
import { buildTopMetadata } from '@/src/lib/signs/metadata'
import {
  getCategoryEditorsPicks,
  getTopAllTimeSigns,
  getTrendingSigns,
} from '@/src/lib/signs/ranking'
import { SIGN_CATEGORIES, type SignCategory } from '@/src/lib/signs/types'

type TopCategoryPageProps = {
  params: Promise<{ category: string }>
}

type TopPageContent = {
  eyebrow: string
  title: string
  description: string
  methodology: string
}

const TOP_PAGE_CONTENT: Record<SignCategory, TopPageContent> = {
  funny: {
    eyebrow: 'Ranking desk: funny lane',
    title: 'Top funny No Kings protest signs ranked by crowd response and freshness',
    description:
      'This ranking page is for people who want the leaders first, not the full discovery wall. It spotlights the strongest vote-getters, the fast risers, and the editor-backed comic cards inside the funny category.',
    methodology:
      'All-time leaders sort by vote count, trending cards blend freshness with votes, and editor picks highlight launch-desk choices that still convert in photos and on march routes.',
  },
  best: {
    eyebrow: 'Ranking desk: classic lane',
    title: 'Top best No Kings protest signs for the clearest democratic read',
    description:
      'This page separates the ranked winners from the broader idea wall. It is built for visitors who want the strongest overall slogans first, plus a quick explanation of why those signs keep leading.',
    methodology:
      'The ranking desk combines raw vote totals, recency-aware momentum, and editor curation to keep timeless civic lines visible without turning the page into a duplicate category grid.',
  },
  kids: {
    eyebrow: 'Ranking desk: family-safe lane',
    title: 'Top kids-friendly No Kings protest signs for family marches and school pickups',
    description:
      'This ranked view favors the safest high-performing signs for younger marchers and mixed-age groups. It is intentionally different from the broader category page, which carries the full discovery set.',
    methodology:
      'Votes surface the broadest favorites, trending catches newer family-safe entries, and editor picks help keep the most reusable classroom-ready phrasing near the top.',
  },
  printable: {
    eyebrow: 'Ranking desk: printable lane',
    title: 'Top printable No Kings protest signs for quick output and clean visibility',
    description:
      'This top list is designed for people who want the shortest path to proven printable copy. It emphasizes ranking signals over exploration so the page can target a different search intent from the printable ideas page.',
    methodology:
      'Vote totals reward durable favorites, trending keeps faster-moving poster lines visible, and editor picks highlight layouts that stay legible after a fast print-and-go workflow.',
  },
}

function isSignCategory(value: string): value is SignCategory {
  return SIGN_CATEGORIES.includes(value as SignCategory)
}

function getCategoryOrThrow(value: string): SignCategory {
  if (!isSignCategory(value)) {
    notFound()
  }

  return value
}

function formatCategoryLabel(category: SignCategory) {
  return category.charAt(0).toUpperCase() + category.slice(1)
}

function buildTopCategoryHref(category: SignCategory) {
  return `/topics/no-kings/top/${category}`
}

export function generateStaticParams() {
  return SIGN_CATEGORIES.map((category) => ({ category }))
}

export async function generateMetadata({ params }: TopCategoryPageProps): Promise<Metadata> {
  const category = getCategoryOrThrow((await params).category)
  const metadata = buildTopMetadata(category)
  const canonicalPath = `/topics/no-kings/top/${category}`

  return {
    title: metadata.title,
    description: metadata.description,
    keywords: metadata.keywords,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title: metadata.title,
      description: metadata.description,
      type: 'website',
      url: `${siteConfig.url}${canonicalPath}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: metadata.title,
      description: metadata.description,
    },
  }
}

export default async function TopCategoryPage({ params }: TopCategoryPageProps) {
  const category = getCategoryOrThrow((await params).category)
  const content = TOP_PAGE_CONTENT[category]
  const allTimeLeaders = getTopAllTimeSigns(category, 8)
  const trendingSigns = getTrendingSigns(category, 4)
  const editorsPicks = getCategoryEditorsPicks(category, 4)
  const siblingCategories = SIGN_CATEGORIES.filter((entry) => entry !== category)

  return (
    <div className="topic-page topic-page--ranking">
      <header className="topic-page__hero topic-page__hero--ranking">
        <div className="topic-page__copy">
          <p className="section-heading__eyebrow">{content.eyebrow}</p>
          <h1 className="topic-page__title">{content.title}</h1>
          <p className="topic-page__lede">{content.description}</p>
          <p className="topic-page__supporting">{content.methodology}</p>

          <div className="topic-page__actions">
            <Link className="site-cta" href={buildCategoryHref(category)}>
              Browse the full {category} idea wall
            </Link>
            <Link className="home-hero__secondary" href="/submit">
              Preview a new sign idea
            </Link>
          </div>
        </div>

        <section aria-labelledby="ranking-snapshot-title" className="ranking-strip">
          <div className="section-heading section-heading--compact">
            <p className="section-heading__eyebrow">Snapshot</p>
            <h2 className="section-heading__title" id="ranking-snapshot-title">
              Current leaders in the {formatCategoryLabel(category)} lane
            </h2>
          </div>

          <ol className="ranking-strip__list">
            {allTimeLeaders.slice(0, 3).map((sign, index) => (
              <li key={sign.slug} className="ranking-strip__item">
                <p className="ranking-strip__rank">#{index + 1}</p>
                <div>
                  <p className="ranking-strip__title">{sign.title}</p>
                  <p className="ranking-strip__description">{sign.voteCount} votes · {sign.sourceType}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </header>

      <SignGrid
        description={`The highest-voted ${category} No Kings protest signs in the catalog right now.`}
        eyebrow="All-time leaders"
        id={`${category}-top-all-time`}
        signs={allTimeLeaders}
        title={`Top ${formatCategoryLabel(category)} No Kings protest signs of all time`}
      />

      <SignGrid
        description={`Momentum matters here: these ${category} signs are climbing on freshness, votes, and recent visibility.`}
        eyebrow="Trending now"
        id={`${category}-top-trending`}
        signs={trendingSigns}
        title={`Trending ${formatCategoryLabel(category)} No Kings signs right now`}
      />

      <SignGrid
        description={`Editorial selections stay separate from raw vote totals so this ranking page can surface stronger launch art without duplicating the category-page intro.`}
        eyebrow="Editors' selections"
        id={`${category}-top-editors-picks`}
        signs={editorsPicks}
        title={`Editors' picks inside the ${formatCategoryLabel(category)} ranking stack`}
      />

      <section aria-labelledby="ranking-links-title" className="topic-page__panel">
        <div className="section-heading section-heading--compact">
          <p className="section-heading__eyebrow">Keep comparing</p>
          <h2 className="section-heading__title" id="ranking-links-title">
            Jump to another ranking lane or return to discovery mode
          </h2>
          <p className="section-heading__description">
            These links help users move between ranked intent and broader browsing without cannibalizing the category landing pages.
          </p>
        </div>

        <div className="topic-links" role="list">
          <div role="listitem">
            <Link className="topic-links__item" href={buildCategoryHref(category)}>
              <p className="topic-links__eyebrow">Discovery page</p>
              <p className="topic-links__title">Back to all {formatCategoryLabel(category)} ideas</p>
              <p className="topic-links__description">
                Use the full category wall when you want the broader idea set instead of a ranked list.
              </p>
            </Link>
          </div>

          {siblingCategories.map((siblingCategory) => (
            <div key={siblingCategory} role="listitem">
              <Link className="topic-links__item" href={buildTopCategoryHref(siblingCategory)}>
                <p className="topic-links__eyebrow">Top {formatCategoryLabel(siblingCategory)}</p>
                <p className="topic-links__title">Switch ranking lanes</p>
                <p className="topic-links__description">
                  Compare how the strongest {siblingCategory} signs are performing without leaving the top-list format.
                </p>
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
