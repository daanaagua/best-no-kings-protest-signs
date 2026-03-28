export type SiteLink = {
  label: string
  href: string
}

export type SiteLinkGroup = {
  heading: string
  links: SiteLink[]
}

export const siteConfig = {
  name: 'Best No Kings Protest Signs',
  domainLabel: 'BESTNOKINGSPROTESTSIGNS.ORG',
  url: 'https://bestnokingsprotestsigns.org',
  description:
    'Browse the best No Kings protest signs, funny sign ideas, printable slogans, and community-submitted designs. Vote on favorites or submit your own sign.',
  headerNote: 'Poster-ready civic signs for marches, rallies, and printable share-outs.',
  footerNote:
    'A poster-bright civic archive for sharp slogans, printable ideas, and community submissions that stay readable on sidewalks, in nav bars, and across social shares.',
  primaryAction: {
    label: 'Submit a Sign',
    href: '/submit',
  },
  footerGroups: [
    {
      heading: 'Trust',
      links: [
        { label: 'About', href: '/about' },
        { label: 'Content Policy', href: '/content-policy' },
        { label: 'Submit a Sign', href: '/submit' },
      ],
    },
    {
      heading: 'Policies',
      links: [
        { label: 'Privacy Policy', href: '/privacy-policy' },
        { label: 'Terms', href: '/terms' },
      ],
    },
  ] satisfies SiteLinkGroup[],
} as const
