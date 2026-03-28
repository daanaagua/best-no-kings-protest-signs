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
    'Browse the best No Kings protest signs, funny sign ideas, printable slogans, and approved community designs. Static launch keeps public voting and new submissions in beta.',
  headerNote: 'Poster-ready civic signs for marches, rallies, printable share-outs, and a preview-only submit beta.',
  footerNote:
    'A poster-bright civic archive for sharp slogans, printable ideas, and approved community additions while public write features stay in beta for launch.',
  primaryAction: {
    label: 'Preview your sign',
    href: '/submit',
  },
  footerGroups: [
    {
        heading: 'Trust',
        links: [
          { label: 'About', href: '/about' },
          { label: 'Content Policy', href: '/content-policy' },
          { label: 'Preview your sign', href: '/submit' },
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
