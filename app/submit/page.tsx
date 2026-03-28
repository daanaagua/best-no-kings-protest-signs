import { SubmitForm } from '@/src/components/submit/submit-form'

export const dynamic = 'force-dynamic'

export default function SubmitPage() {
  return (
    <div className="submit-page">
      <section className="submit-page__hero">
        <div className="section-heading">
          <p className="section-heading__eyebrow">Submit a sign</p>
          <h1 className="section-heading__title">
            Community slogans start here, then move through a lightweight moderation queue
          </h1>
          <p className="section-heading__description">
            This MVP keeps the workflow intentionally simple: live preview, one template choice, two trust checks, and a real pending-review handoff into file-backed storage.
          </p>
        </div>
      </section>

      <SubmitForm />
    </div>
  )
}
