import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="topic-page">
      <section className="topic-page__hero">
        <div className="topic-page__copy">
          <p className="section-heading__eyebrow">404</p>
          <h1 className="topic-page__title">That poster board is blank</h1>
          <p className="topic-page__lede">
            The page you requested is not part of the current Best No Kings Protest Signs archive.
          </p>
          <p className="topic-page__supporting">
            Try the homepage, browse one of the live topic routes, or head to the preview-only submit beta to sketch a
            new idea before public submissions reopen.
          </p>

          <div className="topic-page__actions">
            <Link className="site-cta" href="/">
              Return home
            </Link>
            <Link className="home-hero__secondary" href="/submit">
              Preview your sign
            </Link>
          </div>
        </div>

        <dl className="topic-page__stats">
          <div className="topic-page__stat">
            <dt>Popular route</dt>
            <dd>Funny</dd>
            <p className="topic-page__stat-note">/topics/no-kings/funny</p>
          </div>
          <div className="topic-page__stat">
            <dt>Policy route</dt>
            <dd>Trust</dd>
            <p className="topic-page__stat-note">/about and policy pages stay available</p>
          </div>
          <div className="topic-page__stat">
            <dt>Next step</dt>
            <dd>Browse</dd>
            <p className="topic-page__stat-note">Return to the archive or open the preview-only submit beta</p>
          </div>
        </dl>
      </section>

      <section aria-labelledby="not-found-links-title" className="topic-page__panel">
        <div className="section-heading section-heading--compact">
          <p className="section-heading__eyebrow">Useful links</p>
          <h2 className="section-heading__title" id="not-found-links-title">
            Jump back into live sections of the site
          </h2>
        </div>

        <div className="topic-links" role="list">
          <div role="listitem">
            <Link className="topic-links__item" href="/">
              <p className="topic-links__eyebrow">Homepage</p>
              <p className="topic-links__title">See the editorial picks and trending signs</p>
              <p className="topic-links__description">Start with the main archive and current community highlights.</p>
            </Link>
          </div>
          <div role="listitem">
            <Link className="topic-links__item" href="/about">
              <p className="topic-links__eyebrow">Trust</p>
              <p className="topic-links__title">Read about the project and moderation model</p>
              <p className="topic-links__description">Review launch context, policies, and public-site standards.</p>
            </Link>
          </div>
          <div role="listitem">
            <Link className="topic-links__item" href="/topics/no-kings/best">
              <p className="topic-links__eyebrow">Category</p>
              <p className="topic-links__title">Browse the best No Kings sign ideas</p>
              <p className="topic-links__description">Move directly into a live category page with ranked internal links.</p>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
