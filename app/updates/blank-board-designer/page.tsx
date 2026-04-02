import type { Metadata } from 'next'
import Link from 'next/link'

import { siteConfig } from '@/src/data/site'

export const metadata: Metadata = {
  title: `Sign maker update | ${siteConfig.name}`,
  description:
    'Learn what changed in the sign maker update, including blank boards by default, ratio presets, image uploads, and free text placement.',
  alternates: {
    canonical: '/updates/blank-board-designer',
  },
}

const highlights = [
  'Blank boards now open by default so the editor starts from a clean canvas.',
  'White-board layouts now include ratio presets for square, portrait, and landscape signs.',
  'Image uploads and free text placement make the sign maker behave more like a real board designer.',
] as const

export default function BlankBoardDesignerUpdatePage() {
  return (
    <div className="topic-page updates-page">
      <section className="topic-page__hero updates-page__hero">
        <div className="topic-page__copy">
          <p className="section-heading__eyebrow">Product update</p>
          <h1 className="topic-page__title">The sign maker now starts on a blank board</h1>
          <p className="topic-page__lede">
            The latest sign maker update adds ratio presets, image uploads, and free text placement so it feels closer to building a real protest sign instead of tuning sliders.
          </p>
          <p className="topic-page__supporting">
            We rebuilt the default editing flow so people can start on a clean board, switch formats quickly, and compose a sign around their own message and imagery.
          </p>
        </div>
      </section>

      <section className="topic-page__panel">
        <div className="section-heading section-heading--compact">
          <p className="section-heading__eyebrow">What changed</p>
          <h2 className="section-heading__title">A cleaner starting point and a more flexible board</h2>
        </div>
        <div className="faq-list">
          {highlights.map((item) => (
            <article key={item} className="faq-item">
              <p className="faq-item__answer">{item}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="topic-page__panel">
        <div className="section-heading section-heading--compact">
          <p className="section-heading__eyebrow">Why we rebuilt it</p>
          <h2 className="section-heading__title">The old editor was too rigid for real sign-making</h2>
        </div>
        <div className="seo-copy__body">
          <p>
            The previous editor was useful for quick slogan previews, but it still behaved like a single text treatment with controls around the outside. That made it harder to build signs around personal imagery, multiple text blocks, or different print formats.
          </p>
          <p>
            This update shifts the experience closer to how people actually compose a board for a rally: start from a clean surface, move things directly on the sign, and choose a shape that fits the way the sign will be printed or shared.
          </p>
        </div>
      </section>

      <section className="topic-page__panel">
        <div className="section-heading section-heading--compact">
          <p className="section-heading__eyebrow">What you can do now</p>
          <h2 className="section-heading__title">Build signs around your own layout instead of one preset frame</h2>
        </div>
        <div className="seo-copy__body">
          <p>Start on a blank board immediately, switch the white-board ratio, add multiple text boxes, and upload an image without leaving the sign maker.</p>
          <p>The decorated templates are still there when you want a faster layout, but the default path now stays open-ended for people who want more control over the final board.</p>
        </div>
      </section>

      <section className="topic-page__panel updates-page__cta">
        <div className="section-heading section-heading--compact">
          <p className="section-heading__eyebrow">Try it now</p>
          <h2 className="section-heading__title">Take the new blank board for a spin</h2>
          <p className="section-heading__description">
            Open the sign maker if you want to start from the cleaner default canvas, test the new ratios, or build a board around your own image and text layout.
          </p>
        </div>

        <Link className="site-cta" href="/submit">
          Open the sign maker
        </Link>
      </section>
    </div>
  )
}
