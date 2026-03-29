import { SubmitForm } from '@/src/components/submit/submit-form'
import { isCommunityMvpEnabled } from '@/src/lib/runtime-mode'

export const dynamic = 'force-dynamic'

export default function SubmitPage() {
  const communityMvpEnabled = isCommunityMvpEnabled()

  return (
    <div className="submit-page">
      <section className="submit-page__hero">
        <div className="section-heading">
          <p className="section-heading__eyebrow">Sign maker</p>
          <h1 className="section-heading__title">Make your No Kings sign</h1>
          <p className="section-heading__description">
            {communityMvpEnabled
              ? 'Switch board templates, tune the text, and send your finished design to the moderation queue for review.'
              : 'Switch board templates, tune the text, and export a PNG built for marches, rallies, printouts, and quick sharing.'}
          </p>
        </div>
      </section>

      <SubmitForm communityMvpEnabled={communityMvpEnabled} />
    </div>
  )
}
