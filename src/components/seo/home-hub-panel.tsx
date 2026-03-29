import Link from 'next/link'

type HomeHubPanelProps = {
  eyebrow: string
  title: string
  description: string
  homeLabel: string
  homeDescription: string
  secondaryLabel?: string
  secondaryHref?: string
  secondaryDescription?: string
}

export function HomeHubPanel({
  eyebrow,
  title,
  description,
  homeLabel,
  homeDescription,
  secondaryLabel,
  secondaryHref,
  secondaryDescription,
}: HomeHubPanelProps) {
  const showSecondary = Boolean(secondaryLabel && secondaryHref && secondaryDescription)

  return (
    <section aria-labelledby="home-hub-panel-title" className="topic-page__panel">
      <div className="section-heading section-heading--compact">
        <p className="section-heading__eyebrow">{eyebrow}</p>
        <h2 className="section-heading__title" id="home-hub-panel-title">
          {title}
        </h2>
        <p className="section-heading__description">{description}</p>
      </div>

      <div className="topic-links" role="list">
        <div role="listitem">
          <Link className="topic-links__item" href="/">
            <p className="topic-links__eyebrow">Homepage hub</p>
            <p className="topic-links__title">{homeLabel}</p>
            <p className="topic-links__description">{homeDescription}</p>
          </Link>
        </div>

        {showSecondary ? (
          <div role="listitem">
            <Link className="topic-links__item" href={secondaryHref!}>
              <p className="topic-links__eyebrow">Next step</p>
              <p className="topic-links__title">{secondaryLabel}</p>
              <p className="topic-links__description">{secondaryDescription}</p>
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  )
}
