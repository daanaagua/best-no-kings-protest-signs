import type { Metadata } from 'next'

import { siteConfig } from '@/src/data/site'

export const metadata: Metadata = {
  title: `Privacy Policy | ${siteConfig.name}`,
  description:
    'Understand what limited submission, moderation, and vote data the MVP stores, how it is used, and what is not collected.',
  alternates: {
    canonical: '/privacy-policy',
  },
}

const privacyCards = [
  {
    title: 'Information you provide',
    body:
      'If you submit a sign, the MVP may store your slogan, chosen template, optional name, optional email address, submission timestamp, and any moderation note attached to that record.',
  },
  {
    title: 'Operational data we store',
    body:
      'The MVP stores approved-submission records and vote totals in local JSON data files so the public wall and moderation route can work without a database.',
  },
  {
    title: 'What we do not offer',
    body:
      'The launch version does not include user accounts, paid memberships, or a broad profile system. We do not ask for unnecessary personal details to browse public pages.',
  },
] as const

export default function PrivacyPolicyPage() {
  return (
    <div className="topic-page">
      <section className="topic-page__hero">
        <div className="topic-page__copy">
          <p className="section-heading__eyebrow">Privacy policy</p>
          <h1 className="topic-page__title">Limited MVP data collection for submissions and vote tracking</h1>
          <p className="topic-page__lede">
            {siteConfig.name} is built as a lightweight MVP. Most visitors can browse without creating an account,
            and the site only stores the small amount of information needed to accept submissions, moderate them,
            and keep vote totals working.
          </p>
          <p className="topic-page__supporting">
            This page describes what the MVP stores today. If analytics, advertising integrations, or durable cloud
            data services are added later, this policy should be updated before those changes go live.
          </p>
        </div>

        <dl className="topic-page__stats">
          <div className="topic-page__stat">
            <dt>Accounts</dt>
            <dd>No</dd>
          </div>
          <div className="topic-page__stat">
            <dt>Submission data</dt>
            <dd>Limited</dd>
          </div>
          <div className="topic-page__stat">
            <dt>MVP storage</dt>
            <dd>Local</dd>
          </div>
        </dl>
      </section>

      <section aria-labelledby="privacy-cards-title" className="topic-page__panel">
        <div className="section-heading section-heading--compact">
          <p className="section-heading__eyebrow">Stored information</p>
          <h2 className="section-heading__title" id="privacy-cards-title">
            What the launch version keeps and why
          </h2>
        </div>

        <div className="faq-list">
          {privacyCards.map((item) => (
            <article key={item.title} className="faq-item">
              <h3 className="faq-item__question">{item.title}</h3>
              <p className="faq-item__answer">{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="topic-page__panel">
        <div className="section-heading section-heading--compact">
          <p className="section-heading__eyebrow">Use and retention</p>
          <h2 className="section-heading__title">Submission and vote data are used to operate the site</h2>
        </div>
        <div className="seo-copy__body">
          <p>
            Submission data is used to review community slogans, publish approved entries, and maintain basic
            moderation history. Vote data is used to display popularity counts for signs in the public archive.
          </p>
          <p>
            We do not sell personal information in this MVP. Records may be retained as long as they are useful for
            moderation, auditing, or operating the public collection.
          </p>
        </div>
      </section>
    </div>
  )
}
