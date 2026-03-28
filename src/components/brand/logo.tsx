import Link from 'next/link'

import { siteConfig } from '@/src/data/site'

type LogoProps = {
  href?: string
  className?: string
  showDomain?: boolean
}

function LogoMark() {
  return (
    <svg
      aria-hidden="true"
      className="logo-mark"
      viewBox="0 0 92 104"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M42 65L35 98.5C34.6 100.6 36.2 102.5 38.4 102.5H50.8C53 102.5 54.7 100.5 54.2 98.4L46.9 65"
        fill="#BD7A31"
      />
      <path
        d="M18.6 15.1C18.6 10.9 22 7.5 26.2 7.5H69.3C73.5 7.5 76.9 10.9 76.9 15.1V55.5C76.9 59.7 73.5 63.1 69.3 63.1H26.2C22 63.1 18.6 59.7 18.6 55.5V15.1Z"
        fill="#FFF8EE"
        stroke="#162635"
        strokeWidth="5"
        transform="rotate(-6 47.75 35.3)"
      />
      <path
        d="M31.2 45.2L38.5 29.5L46.6 38.1L53.8 24.4L61.5 34.3L68.8 21.3L71.7 45.2H31.2Z"
        stroke="#162635"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M28 52.5L67 21.5"
        stroke="#D45736"
        strokeWidth="8"
        strokeLinecap="round"
      />
    </svg>
  )
}

function LogoContent({ showDomain = true }: Pick<LogoProps, 'showDomain'>) {
  return (
    <>
      <LogoMark />
      <span className="logo-copy">
        <span className="logo-kicker">People power, poster bright</span>
        <span className="logo-title">Best No Kings Protest Signs</span>
        {showDomain ? (
          <span className="logo-domain">{siteConfig.domainLabel}</span>
        ) : null}
      </span>
    </>
  )
}

export function Logo({ href = '/', className, showDomain = true }: LogoProps) {
  const classes = ['logo-lockup', className].filter(Boolean).join(' ')

  return (
    <Link aria-label={siteConfig.name} className={classes} href={href}>
      <LogoContent showDomain={showDomain} />
    </Link>
  )
}
