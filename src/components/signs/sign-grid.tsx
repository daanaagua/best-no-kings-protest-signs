import type { SignRecord } from '@/src/lib/signs/types'

import { SignCard } from '@/src/components/signs/sign-card'

type SignGridProps = {
  title: string
  description: string
  signs: SignRecord[]
  eyebrow?: string
  id?: string
}

export function SignGrid({ title, description, signs, eyebrow, id }: SignGridProps) {
  if (signs.length === 0) {
    return null
  }

  return (
    <section aria-labelledby={id ? `${id}-title` : undefined} className="home-section sign-grid-section" id={id}>
      <div className="section-heading">
        {eyebrow ? <p className="section-heading__eyebrow">{eyebrow}</p> : null}
        <h2 className="section-heading__title" id={id ? `${id}-title` : undefined}>
          {title}
        </h2>
        <p className="section-heading__description">{description}</p>
      </div>

      <div className="sign-grid" role="list">
        {signs.map((sign) => (
          <div key={sign.slug} role="listitem">
            <SignCard sign={sign} />
          </div>
        ))}
      </div>
    </section>
  )
}
