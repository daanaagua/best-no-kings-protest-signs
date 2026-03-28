import { INTERNAL_MODERATION_BETA_MESSAGE } from '@/src/lib/launch-mode'

export const metadata = {
  title: 'Internal Moderation Beta | Best No Kings Protest Signs',
  description:
    'Internal-only moderation placeholder for the Best No Kings Protest Signs launch workflow.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function ModerationPage() {
  return (
    <div className="moderation-page">
      <section className="moderation-page__panel">
        <div className="section-heading">
          <p className="section-heading__eyebrow">Internal moderation beta</p>
          <h1 className="section-heading__title">Internal workflow placeholder</h1>
          <p className="section-heading__description">
            {INTERNAL_MODERATION_BETA_MESSAGE} For the Cloudflare launch, public content is deployed as a static-first archive and moderation is intentionally kept out of the live Worker runtime.
          </p>
          <p className="section-heading__description">
            This page is not a live moderation dashboard. If you need real moderation later, move submissions and votes to durable Cloudflare storage first, then restore a protected review dashboard.
          </p>
        </div>
      </section>
    </div>
  )
}
