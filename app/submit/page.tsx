import { HomeHubPanel } from '@/src/components/seo/home-hub-panel'
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
              ? 'Start from a blank white board or a rally template, add text boxes and images freely, then send the finished board to moderation.'
              : 'Start from a blank white board or a rally template, place text and images directly on the sign, and export a PNG ready for print or sharing.'}
          </p>
        </div>
      </section>

      <SubmitForm communityMvpEnabled={communityMvpEnabled} />

      <HomeHubPanel
        description="The submit route supports custom boards, but the homepage remains the broadest target for visitors looking for the best No Kings protest signs before they start editing."
        eyebrow="Main keyword hub"
        homeDescription="Open the homepage when you want the full wall of best No Kings protest signs and approved public ideas before creating your own."
        homeLabel="Browse all best No Kings protest signs"
        secondaryDescription="If you want curated leaderboards instead of the full wall, compare the top-performing signs next."
        secondaryHref="/topics/no-kings/top/best"
        secondaryLabel="See the top-ranked No Kings signs"
        title="Need ideas first? Go back to the main archive"
      />
    </div>
  )
}
