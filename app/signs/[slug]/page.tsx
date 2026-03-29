import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { buildCategoryHref } from '@/src/components/home/category-rail'
import { HomeHubPanel } from '@/src/components/seo/home-hub-panel'
import { SignDetail } from '@/src/components/signs/sign-detail'
import { SignGrid } from '@/src/components/signs/sign-grid'
import { siteConfig } from '@/src/data/site'
import { buildSignMetadata } from '@/src/lib/signs/metadata'
import { getRelatedSignsAsync, getSignBySlugAsync } from '@/src/lib/signs/queries'

function getMetadataImages(sign: { image: string; title: string }) {
  if (sign.image.startsWith('data:')) {
    return undefined
  }

  return [
    {
      url: sign.image,
      alt: sign.title,
    },
  ]
}

type SignPageProps = {
  params: Promise<{ slug: string }>
}

export const dynamic = 'force-dynamic'

function buildTopCategoryHref(category: string) {
  return `/topics/no-kings/top/${category}`
}

export async function generateMetadata({ params }: SignPageProps): Promise<Metadata> {
  const sign = await getSignBySlugAsync((await params).slug)

  if (!sign) {
    notFound()
  }

  const metadata = buildSignMetadata(sign)
  const canonicalPath = `/signs/${sign.slug}`
  const images = getMetadataImages(sign)

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
      type: 'article',
      url: `${siteConfig.url}${canonicalPath}`,
      images,
    },
    twitter: {
      card: 'summary_large_image',
      title: metadata.title,
      description: metadata.description,
      images: images?.map((image) => image.url),
    },
  }
}

export default async function SignPage({ params }: SignPageProps) {
  const sign = await getSignBySlugAsync((await params).slug)

  if (!sign) {
    notFound()
  }

  const relatedSigns = await getRelatedSignsAsync(sign.slug, sign.primaryCategory, 4)
  const shareUrl = `${siteConfig.url}/signs/${sign.slug}`

  return (
    <div className="sign-detail-page">
      <SignDetail shareUrl={shareUrl} sign={sign} />

      <section aria-labelledby="sign-detail-links-title" className="topic-page__panel">
        <div className="section-heading section-heading--compact">
          <p className="section-heading__eyebrow">Keep exploring</p>
          <h2 className="section-heading__title" id="sign-detail-links-title">
            Move from this exact sign back into the wider No Kings archive
          </h2>
          <p className="section-heading__description">
            Detail pages target exact-sign and long-tail intent, so the next best step is usually a category browse or a ranked comparison page.
          </p>
        </div>

        <div className="topic-links" role="list">
          <div role="listitem">
            <Link className="topic-links__item" href={buildCategoryHref(sign.primaryCategory)}>
              <p className="topic-links__eyebrow">Category wall</p>
              <p className="topic-links__title">Browse more {sign.primaryCategory} signs</p>
              <p className="topic-links__description">
                See the full discovery page for this lane, including official art and approved community additions.
              </p>
            </Link>
          </div>

          <div role="listitem">
            <Link className="topic-links__item" href={buildTopCategoryHref(sign.primaryCategory)}>
              <p className="topic-links__eyebrow">Top list</p>
              <p className="topic-links__title">Compare against ranked leaders</p>
              <p className="topic-links__description">
                Check how this sign sits beside the most popular entries in the {sign.primaryCategory} lane.
              </p>
            </Link>
          </div>

          <div role="listitem">
            <Link className="topic-links__item" href="/submit">
              <p className="topic-links__eyebrow">Community route</p>
              <p className="topic-links__title">Make your own sign</p>
              <p className="topic-links__description">
                Open the builder to sketch your own board, tune the lettering, and export a ready-to-carry PNG.
              </p>
            </Link>
          </div>
        </div>
      </section>

      <SignGrid
        description={`Related ${sign.primaryCategory} No Kings protest signs that share the same category lane without repeating this exact card.`}
        eyebrow="Related signs"
        id="related-signs"
        signs={relatedSigns}
        title={`More ${sign.primaryCategory} No Kings signs worth opening next`}
      />

      <HomeHubPanel
        description="Exact sign pages are useful for long-tail searches, but the homepage is still the main hub for the broad best-no-kings query and stronger discovery paths."
        eyebrow="Main keyword hub"
        homeDescription="Return to the homepage if you want to compare this sign with the broader wall of best No Kings protest signs."
        homeLabel="Browse all best No Kings protest signs"
        secondaryDescription="Open the live builder if this detail page gave you an idea for your own board."
        secondaryHref="/submit"
        secondaryLabel="Make your own No Kings sign"
        title="Move from this detail page back into the main archive"
      />
    </div>
  )
}
