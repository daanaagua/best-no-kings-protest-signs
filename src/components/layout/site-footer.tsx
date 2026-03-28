import Link from 'next/link'

import { Logo } from '@/src/components/brand/logo'
import { siteConfig } from '@/src/data/site'

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__lead">
          <Logo className="site-footer__brand" showDomain={false} />
          <p className="site-footer__note">{siteConfig.footerNote}</p>
        </div>

        <div className="site-footer__groups">
          {siteConfig.footerGroups.map((group) => (
            <nav
              key={group.heading}
              aria-label={group.heading}
              className="site-footer__group"
            >
              <p className="site-footer__heading">{group.heading}</p>
              <ul className="site-footer__list">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link className="site-footer__link" href={link.href}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>
    </footer>
  )
}
