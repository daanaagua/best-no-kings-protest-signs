import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { buildCategoryHref } from '@/src/components/home/category-rail'
import { SignGrid } from '@/src/components/signs/sign-grid'
import { siteConfig } from '@/src/data/site'
import { buildCategoryMetadata } from '@/src/lib/signs/metadata'
import { getSignsByCategory } from '@/src/lib/signs/queries'
import { getTopAllTimeSigns } from '@/src/lib/signs/ranking'
import { SIGN_CATEGORIES, type SignCategory } from '@/src/lib/signs/types'

type CategoryPageProps = {
  params: Promise<{ category: string }>
}

type CategoryPageContent = {
  eyebrow: string
  title: string
  description: string
  supportingCopy: string
  faqHeading: string
  faqs: Array<{ question: string; answer: string }>
}

const CATEGORY_PAGE_CONTENT: Record<SignCategory, CategoryPageContent> = {
  funny: {
    eyebrow: 'Comic timing for march day',
    title: 'Funny No Kings protest sign ideas that still read clean from the curb',
    description:
      'Funny No Kings signs win when the joke lands fast, survives a phone crop, and keeps the chant readable from the second row. This page collects the sharpest comic lines, visual gags, and punchy poster copy in the launch wall.',
    supportingCopy:
      'Use this category when you want humor to open the conversation without turning the sign into an inside joke. The strongest cards here keep the anti-monarchy read obvious even when the crowd is moving.',
    faqHeading: 'Funny sign FAQ',
    faqs: [
      {
        question: 'What makes a funny No Kings sign work in a crowd?',
        answer:
          'The joke needs to land in one glance. Short lines, familiar monarchy references, and strong contrast keep the humor visible from a march route or a social share.',
      },
      {
        question: 'Should funny signs stay family-safe?',
        answer:
          'Usually yes. Clean humor travels farther online, fits mixed-age rallies, and keeps the political message usable for more groups without losing bite.',
      },
    ],
  },
  best: {
    eyebrow: 'Evergreen rally language',
    title: 'Best No Kings protest sign ideas for the main camera shot and the long chant line',
    description:
      'The best No Kings signs carry the clearest democratic message. This landing page focuses on the strongest all-around slogans, dependable rally phrases, and poster lines that hold up across marches, libraries, school pickups, and civic events.',
    supportingCopy:
      'If you want a sign that feels timeless instead of topical, start here. These cards prioritize clarity, crowd resonance, and broad shareability over narrower joke formats.',
    faqHeading: 'Best-sign FAQ',
    faqs: [
      {
        question: 'When should I pick a classic sign instead of a joke sign?',
        answer:
          'Choose a classic line when you want the clearest civic stance, an evergreen photo, or a slogan that can be reused across multiple marches without explanation.',
      },
      {
        question: 'What does this category optimize for?',
        answer:
          'It optimizes for broad usefulness: clean wording, strong democratic framing, and phrases that still work when cropped into vertical video or a square image.',
      },
    ],
  },
  kids: {
    eyebrow: 'Family-safe rally copy',
    title: 'Kids-friendly No Kings protest sign ideas for school pickups, family marches, and neighborhood walks',
    description:
      'Kids-safe No Kings signs need to be bright, understandable, and genuinely usable by younger marchers. This category gathers softer phrasing, classroom-ready humor, and family-friendly poster copy that still keeps the message intact.',
    supportingCopy:
      'These signs aim for reassurance and clarity rather than edge. They are built for parents, teachers, and organizers who want children to join the visual conversation without carrying hostile text.',
    faqHeading: 'Kids-sign FAQ',
    faqs: [
      {
        question: 'How short should a family-friendly protest sign be?',
        answer:
          'Aim for one bold slogan plus maybe one supportive line. Shorter copy is easier for kids to carry, easier to read from afar, and easier to print at home.',
      },
      {
        question: 'Can family-friendly signs still be memorable?',
        answer:
          'Absolutely. Color, rhythm, and playful phrasing do a lot of the work here. The best family-safe signs stay light without becoming vague.',
      },
    ],
  },
  printable: {
    eyebrow: 'Fast-print poster copy',
    title: 'Printable No Kings protest sign ideas built for home printers, office paper, and quick reruns',
    description:
      'Printable No Kings signs have a different job: fewer words, stronger silhouettes, and lines that stay readable even after home-printer contrast shifts. This page curates the copy that translates best to paper-first use.',
    supportingCopy:
      'Start here when you need a sign in minutes. The collection leans toward bold slogans, crisp typography, and phrases that still feel premium after a quick print-and-tape workflow.',
    faqHeading: 'Printable-sign FAQ',
    faqs: [
      {
        question: 'What makes a sign printable-first?',
        answer:
          'Short copy, strong contrast, and a layout that survives standard paper sizes. Printable-first signs are designed for quick output, not only for hand-lettered boards.',
      },
      {
        question: 'Are printable signs only for solo marchers?',
        answer:
          'No. Printable signs work especially well for groups that need quick duplicates for a school, office, block club, or same-day rally meetup.',
      },
    ],
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

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const category = getCategoryOrThrow((await params).category)
  const metadata = buildCategoryMetadata(category)
  const canonicalPath = `/topics/no-kings/${category}`

  return {
    title: metadata.title,
    description: metadata.description,
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

export default async function CategoryPage({ params }: CategoryPageProps) {
  const category = getCategoryOrThrow((await params).category)
  const content = CATEGORY_PAGE_CONTENT[category]
  const signs = getSignsByCategory(category)
  const topSign = getTopAllTimeSigns(category, 1)[0]
  const relatedCategories = SIGN_CATEGORIES.filter((entry) => entry !== category)

  return (
    <div className="topic-page">
      <header className="topic-page__hero">
        <div className="topic-page__copy">
          <p className="section-heading__eyebrow">{content.eyebrow}</p>
          <h1 className="topic-page__title">{content.title}</h1>
          <p className="topic-page__lede">{content.description}</p>
          <p className="topic-page__supporting">{content.supportingCopy}</p>

          <div className="topic-page__actions">
            <Link className="site-cta" href={buildTopCategoryHref(category)}>
              See the ranked list
            </Link>
            <Link className="home-hero__secondary" href="/submit">
              Save your own idea for review
            </Link>
          </div>
        </div>

        <dl className="topic-page__stats">
          <div className="topic-page__stat">
            <dt>Category signs</dt>
            <dd>{signs.length}</dd>
          </div>
          <div className="topic-page__stat">
            <dt>Community-approved</dt>
            <dd>{signs.filter((sign) => sign.sourceType === 'community').length}</dd>
          </div>
          <div className="topic-page__stat">
            <dt>Current leader</dt>
            <dd>{topSign?.title ?? 'Fresh signs are landing now'}</dd>
            <p className="topic-page__stat-note">
              {topSign ? `${topSign.voteCount.toLocaleString('en-US')} votes` : 'New votes are still reshuffling the board'}
            </p>
          </div>
        </dl>
      </header>

      <SignGrid
        description={`Browse every ${category} No Kings protest sign in the current public wall, including official launch art and approved community additions.`}
        eyebrow="Category wall"
        id={`${category}-category-wall`}
        signs={signs}
        title={`${formatCategoryLabel(category)} No Kings protest signs in the live collection`}
      />

      <section aria-labelledby="related-category-links-title" className="topic-page__panel">
        <div className="section-heading section-heading--compact">
          <p className="section-heading__eyebrow">Related category links</p>
          <h2 className="section-heading__title" id="related-category-links-title">
            Keep browsing the No Kings wall without repeating this page template
          </h2>
          <p className="section-heading__description">
            These adjacent categories catch nearby search intent without mirroring the discovery copy on this landing page.
          </p>
        </div>

        <div className="topic-links" role="list">
          {relatedCategories.map((relatedCategory) => {
            const relatedSigns = getSignsByCategory(relatedCategory)
            const relatedLeader = getTopAllTimeSigns(relatedCategory, 1)[0]

            return (
              <div key={relatedCategory} role="listitem">
                <Link className="topic-links__item" href={buildCategoryHref(relatedCategory)}>
                  <p className="topic-links__eyebrow">{formatCategoryLabel(relatedCategory)}</p>
                  <p className="topic-links__title">{relatedSigns.length} sign ideas</p>
                  <p className="topic-links__description">
                    Leading now: {relatedLeader?.title ?? 'Fresh category highlights'}
                  </p>
                </Link>
              </div>
            )
          })}
        </div>
      </section>

      <section aria-labelledby="category-faq-title" className="topic-page__panel">
        <div className="section-heading section-heading--compact">
          <p className="section-heading__eyebrow">Helpful context</p>
          <h2 className="section-heading__title" id="category-faq-title">
            {content.faqHeading}
          </h2>
        </div>

        <div className="faq-list">
          {content.faqs.map((faq) => (
            <article key={faq.question} className="faq-item">
              <h3 className="faq-item__question">{faq.question}</h3>
              <p className="faq-item__answer">{faq.answer}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
