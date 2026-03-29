import type { Metadata } from 'next'

import { HomeHubPanel } from '@/src/components/seo/home-hub-panel'
import { siteConfig } from '@/src/data/site'

export const metadata: Metadata = {
  title: `Content Policy | ${siteConfig.name}`,
  description:
    'Read the publication and moderation standards for editorial sign ideas, community submissions, and removals on Best No Kings Protest Signs.',
  alternates: {
    canonical: '/content-policy',
  },
}

const policyCards = [
  {
    title: 'What we publish',
    body:
      'Original editorial sign ideas, official launch assets, and approved community slogans that fit the No Kings topic, stay understandable to a general audience, and add practical value to the archive.',
  },
  {
    title: 'What we reject',
    body:
      'Spam, impersonation, explicit sexual content, hateful or threatening material, unlawful instructions, off-topic promotions, and low-quality duplicate submissions that do not improve the collection.',
  },
  {
    title: 'How moderation works',
    body:
      'Community entries begin as pending records. A moderator reviews the slogan, template choice, and fit for the public wall before approving, rejecting, or later removing the content if needed.',
  },
] as const

export default function ContentPolicyPage() {
  return (
    <div className="topic-page">
      <section className="topic-page__hero">
        <div className="topic-page__copy">
          <p className="section-heading__eyebrow">Content policy</p>
          <h1 className="topic-page__title">Moderation standards for a public, brand-safe sign archive</h1>
          <p className="topic-page__lede">
            This site exists to publish original No Kings protest sign ideas and carefully approved community
            additions. The content policy helps keep the archive useful for readers, safe for advertisers, and
            consistent with a general-audience launch.
          </p>
          <p className="topic-page__supporting">
            Editorial content may be updated for clarity, and community submissions may be declined when they do
            not meet quality, originality, or safety expectations.
          </p>
        </div>

        <dl className="topic-page__stats">
          <div className="topic-page__stat">
            <dt>Editorial source</dt>
            <dd>Original</dd>
          </div>
          <div className="topic-page__stat">
            <dt>Submission flow</dt>
            <dd>Reviewed</dd>
          </div>
          <div className="topic-page__stat">
            <dt>Audience standard</dt>
            <dd>General</dd>
          </div>
        </dl>
      </section>

      <section aria-labelledby="policy-cards-title" className="topic-page__panel">
        <div className="section-heading section-heading--compact">
          <p className="section-heading__eyebrow">Publication rules</p>
          <h2 className="section-heading__title" id="policy-cards-title">
            The basic standards behind every public page
          </h2>
        </div>

        <div className="faq-list">
          {policyCards.map((item) => (
            <article key={item.title} className="faq-item">
              <h3 className="faq-item__question">{item.title}</h3>
              <p className="faq-item__answer">{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="topic-page__panel">
        <div className="section-heading section-heading--compact">
          <p className="section-heading__eyebrow">Removal and updates</p>
          <h2 className="section-heading__title">Content can be edited, declined, or removed</h2>
        </div>
        <div className="seo-copy__body">
          <p>
            We may update metadata, descriptions, or categorization to improve accuracy and usability. We may also
            remove content that later appears misleading, unsafe, low-quality, or inconsistent with this policy.
          </p>
          <p>
            Approval in the MVP is not a permanent guarantee of publication. The site operator keeps final
            discretion over what appears on the public archive.
          </p>
        </div>
      </section>

      <HomeHubPanel
        description="A policy page helps trust, but the homepage remains the main ranking target for this site. This panel sends readers back to the strongest commercial and informational hub."
        eyebrow="Main keyword hub"
        homeDescription="Return to the homepage for the best No Kings protest signs, launch-ready ideas, and approved community additions."
        homeLabel="Browse all best No Kings protest signs"
        secondaryDescription="Open the builder if you want to submit a sign that follows the moderation rules on this page."
        secondaryHref="/submit"
        secondaryLabel="Make your own No Kings sign"
        title="Read the rules, then move back to the main sign archive"
      />
    </div>
  )
}
