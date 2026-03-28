import Link from 'next/link'

import { Logo } from '@/src/components/brand/logo'
import { siteConfig } from '@/src/data/site'

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Logo className="site-header__brand" />
        <nav aria-label="Primary" className="site-header__nav">
          <p className="site-header__note">{siteConfig.headerNote}</p>
          <Link className="site-cta" href={siteConfig.primaryAction.href}>
            {siteConfig.primaryAction.label}
          </Link>
        </nav>
      </div>
    </header>
  )
}
