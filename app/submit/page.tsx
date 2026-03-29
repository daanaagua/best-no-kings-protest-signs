import { SubmitForm } from '@/src/components/submit/submit-form'

export default function SubmitPage() {
  return (
    <div className="submit-page">
      <section className="submit-page__hero">
        <div className="section-heading">
          <p className="section-heading__eyebrow">Sign maker</p>
          <h1 className="section-heading__title">Make your No Kings sign</h1>
          <p className="section-heading__description">
            Switch board templates, tune the text, and export a PNG built for marches, rallies, printouts, and quick sharing.
          </p>
        </div>
      </section>

      <SubmitForm />
    </div>
  )
}
