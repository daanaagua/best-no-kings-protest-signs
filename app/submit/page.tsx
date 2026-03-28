import { SubmitForm } from '@/src/components/submit/submit-form'

export default function SubmitPage() {
  return (
    <div className="submit-page">
      <section className="submit-page__hero">
        <div className="section-heading">
          <p className="section-heading__eyebrow">Submit beta</p>
          <h1 className="section-heading__title">
            Preview your No Kings sign now, then come back when public submissions reopen
          </h1>
          <p className="section-heading__description">
            This launch is intentionally static-content-first. The submit route still helps with slogan drafting and template preview, but it does not send live public writes to the server yet.
          </p>
        </div>
      </section>

      <SubmitForm />
    </div>
  )
}
