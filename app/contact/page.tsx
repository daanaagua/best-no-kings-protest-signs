import type { Metadata } from 'next'

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
    </div>
  )
}
