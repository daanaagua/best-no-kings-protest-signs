import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { buildCategoryHref } from '@/src/components/home/category-rail'
import { SignDetail } from '@/src/components/signs/sign-detail'
import { SignGrid } from '@/src/components/signs/sign-grid'
import { siteConfig } from '@/src/data/site'
import { buildSignMetadata } from '@/src/lib/signs/metadata'
import { getAllSigns, getRelatedSigns, getSignBySlug } from '@/src/lib/signs/queries'

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

function buildTopCategoryHref(category: string) {
  return `/topics/no-kings/top/${category}`
}

export function generateStaticParams() {
  return getAllSigns().map((sign) => ({ slug: sign.slug }))
}

export async function generateMetadata({ params }: SignPageProps): Promise<Metadata> {
  const sign = getSignBySlug((await params).slug)

  if (!sign) {
    notFound()
  }

  const metadata = buildSignMetadata(sign)
  const canonicalPath = `/signs/${sign.slug}`
  const images = getMetadataImages(sign)

  return {
    title: metadata.title,
    description: metadata.description,
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
  const sign = getSignBySlug((await params).slug)

  if (!sign) {
    notFound()
  }

  const relatedSigns = getRelatedSigns(sign.slug, sign.primaryCategory, 4)
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
              <p className="topic-links__title">Preview your own sign idea</p>
              <p className="topic-links__description">
                Static launch keeps the submit route in preview-only beta mode, while approved community signs already render on detail pages like this one.
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
    </div>
  )
}
