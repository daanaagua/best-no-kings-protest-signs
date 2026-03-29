import type { Metadata } from 'next'

import { HomeHubPanel } from '@/src/components/seo/home-hub-panel'
import { siteConfig } from '@/src/data/site'

const tallyEmbedUrl =
  'https://tally.so/embed/vG48ad?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1'

export const metadata: Metadata = {
  title: `Contact | ${siteConfig.name}`,
  description: 'Contact Best No Kings Protest Signs through the official Tally form.',
  alternates: {
    canonical: '/contact',
  },
}

export default function ContactPage() {
  return (
    <div className="contact-page">
      <section className="contact-page__panel">
        <iframe
          className="contact-page__frame"
          title="Contact form"
          src={tallyEmbedUrl}
          width="100%"
          height="560"
          frameBorder="0"
          marginHeight={0}
          marginWidth={0}
        />
      </section>

      <HomeHubPanel
        description="Contact pages help trust and support requests, but they should still point users and crawlers back to the homepage that carries the broadest No Kings sign intent."
        eyebrow="Main keyword hub"
        homeDescription="Return to the homepage for the best No Kings protest signs, printable ideas, and approved community uploads."
        homeLabel="Best No Kings protest signs home"
        secondaryDescription="Use the sign maker if your next step is creating or sending a board instead of contacting the site owner."
        secondaryHref="/submit"
        secondaryLabel="Make your own No Kings sign"
        title="Need the main archive instead of the contact form?"
      />
    </div>
  )
}
