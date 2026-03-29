import type { Metadata } from 'next'

import { HomeHubPanel } from '@/src/components/seo/home-hub-panel'
import { siteConfig } from '@/src/data/site'

export const metadata: Metadata = {
  title: `Terms | ${siteConfig.name}`,
  description:
    'Review the basic terms for browsing the site, submitting community content, and using the MVP responsibly.',
  alternates: {
    canonical: '/terms',
  },
}

const termsCards = [
  {
    title: 'Use the site responsibly',
    body:
      'You may browse, share, and reference public pages for lawful purposes. You may not abuse the service, interfere with moderation, or attempt to exploit the MVP infrastructure.',
  },
  {
    title: 'Only submit content you can share',
    body:
      'By submitting a slogan or related information, you represent that you have the right to send it and that it does not violate the content policy or the rights of other people.',
  },
  {
    title: 'Publication stays discretionary',
    body:
      'Submitting content does not guarantee publication. The site operator may review, edit, reject, remove, or re-categorize material at any time to protect quality and safety.',
  },
] as const

export default function TermsPage() {
  return (
    <div className="topic-page">
      <section className="topic-page__hero">
        <div className="topic-page__copy">
          <p className="section-heading__eyebrow">Terms of use</p>
          <h1 className="topic-page__title">Simple launch terms for browsing, sharing, and submitting</h1>
          <p className="topic-page__lede">
            These terms govern use of {siteConfig.name}. They are intentionally concise for the MVP, but they still
            set the basic expectations for lawful browsing, respectful participation, and moderated publication.
          </p>
          <p className="topic-page__supporting">
            If the site grows into a broader platform with user accounts, payments, or third-party services, these
            terms should be expanded before those new features launch.
          </p>
        </div>

        <dl className="topic-page__stats">
          <div className="topic-page__stat">
            <dt>Site type</dt>
            <dd>MVP</dd>
          </div>
          <div className="topic-page__stat">
            <dt>Content flow</dt>
            <dd>Curated</dd>
          </div>
          <div className="topic-page__stat">
            <dt>Availability</dt>
            <dd>As is</dd>
          </div>
        </dl>
      </section>

      <section aria-labelledby="terms-cards-title" className="topic-page__panel">
        <div className="section-heading section-heading--compact">
          <p className="section-heading__eyebrow">Key terms</p>
          <h2 className="section-heading__title" id="terms-cards-title">
            The practical rules for using the site
          </h2>
        </div>

        <div className="faq-list">
          {termsCards.map((item) => (
            <article key={item.title} className="faq-item">
              <h3 className="faq-item__question">{item.title}</h3>
              <p className="faq-item__answer">{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="topic-page__panel">
        <div className="section-heading section-heading--compact">
          <p className="section-heading__eyebrow">Disclaimers</p>
          <h2 className="section-heading__title">The MVP is provided without broad guarantees</h2>
        </div>
        <div className="seo-copy__body">
          <p>
            Public information is provided for general inspiration and browsing convenience. While we aim for
            accuracy and quality, the site is offered on an as-is basis and may change, pause, or remove features
            without notice.
          </p>
          <p>
            You remain responsible for how you use any ideas, downloads, or public content from the site, including
            compliance with local laws, event rules, and platform policies.
          </p>
        </div>
      </section>

      <HomeHubPanel
        description="Terms pages support trust and crawl depth, but they should still hand authority back to the homepage that targets the broadest search demand."
        eyebrow="Main keyword hub"
        homeDescription="Head back to the homepage for the broad archive of best No Kings protest signs, category walls, and printable ideas."
        homeLabel="Browse all best No Kings protest signs"
        secondaryDescription="Open the live builder if you are ready to create or submit your own board."
        secondaryHref="/submit"
        secondaryLabel="Make your own No Kings sign"
        title="Read the terms, then continue into the main sign wall"
      />
    </div>
  )
}
