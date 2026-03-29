import type { Metadata } from 'next'

import { HomeHubPanel } from '@/src/components/seo/home-hub-panel'
import { siteConfig } from '@/src/data/site'

export const metadata: Metadata = {
  title: `About | ${siteConfig.name}`,
  description:
    'Learn how Best No Kings Protest Signs curates original sign ideas, approves community submissions, and keeps the launch archive usable for readers, organizers, and advertisers.',
  alternates: {
    canonical: '/about',
  },
}

const aboutHighlights = [
  {
    title: 'Launch with original editorial work',
    body:
      'The launch collection starts with in-house sign concepts, structured metadata, and official art assets so the site is useful before community submissions enter the wall.',
  },
  {
    title: 'Approve community additions carefully',
    body:
      'Community slogans are reviewed before they appear publicly. The goal is to keep the archive readable, non-duplicative, and safe for general audiences.',
  },
  {
    title: 'Keep the experience practical',
    body:
      'Every page is written for people who need sign ideas quickly, whether they are printing at home, building a family-friendly poster, or browsing the strongest rally copy.',
  },
] as const

export default function AboutPage() {
  return (
    <div className="topic-page">
      <section className="topic-page__hero">
        <div className="topic-page__copy">
          <p className="section-heading__eyebrow">About the project</p>
          <h1 className="topic-page__title">A launch-ready archive for No Kings protest signs</h1>
          <p className="topic-page__lede">
            {siteConfig.name} publishes original sign ideas, organizes them into clear browsing routes,
            and gives approved community submissions a moderated way into the public collection.
          </p>
          <p className="topic-page__supporting">
            The site is designed for quick use on rally day, while still maintaining enough policy and
            moderation structure to support launch trust, advertiser review, and long-tail search traffic.
          </p>
        </div>

        <dl className="topic-page__stats">
          <div className="topic-page__stat">
            <dt>Domain</dt>
            <dd>ORG</dd>
            <p className="topic-page__stat-note">{siteConfig.domainLabel}</p>
          </div>
          <div className="topic-page__stat">
            <dt>Public focus</dt>
            <dd>Original</dd>
            <p className="topic-page__stat-note">Editorial sign ideas plus approved community uploads</p>
          </div>
          <div className="topic-page__stat">
            <dt>Review model</dt>
            <dd>Moderated</dd>
            <p className="topic-page__stat-note">Pending submissions must be approved before publication</p>
          </div>
        </dl>
      </section>

      <section aria-labelledby="about-highlights-title" className="topic-page__panel">
        <div className="section-heading section-heading--compact">
          <p className="section-heading__eyebrow">How the MVP works</p>
          <h2 className="section-heading__title" id="about-highlights-title">
            What readers, contributors, and reviewers should know
          </h2>
        </div>

        <div className="faq-list">
          {aboutHighlights.map((item) => (
            <article key={item.title} className="faq-item">
              <h3 className="faq-item__question">{item.title}</h3>
              <p className="faq-item__answer">{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="topic-page__panel">
        <div className="section-heading section-heading--compact">
          <p className="section-heading__eyebrow">Editorial intent</p>
          <h2 className="section-heading__title">Built for clear civic messaging, not low-quality filler</h2>
        </div>
        <div className="seo-copy__body">
          <p>
            The site favors concise, legible protest copy and original sign treatments over scraped content,
            spun text, or thin placeholder pages. That keeps the archive more useful for visitors and more
            trustworthy for platform review.
          </p>
          <p>
            Community participation matters, but the public wall is intentionally curated. Duplicate slogans,
            abusive phrasing, misleading claims, and submissions that are clearly off-topic can be rejected or
            removed.
          </p>
        </div>
      </section>

      <HomeHubPanel
        description="Policy and background pages should still route readers toward the core homepage that targets the main query and showcases the strongest sign ideas first."
        eyebrow="Main keyword hub"
        homeDescription="Return to the homepage when you want the full archive of best No Kings protest signs instead of policy or project background."
        homeLabel="Browse all best No Kings protest signs"
        secondaryDescription="Open the live builder if you already know the message you want to carry."
        secondaryHref="/submit"
        secondaryLabel="Make your own No Kings sign"
        title="Use this page as context, then go back to the main sign wall"
      />
    </div>
  )
}
