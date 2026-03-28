export type SiteLink = {
  label: string
  href: string
}

export type SiteLinkGroup = {
  heading: string
  links: SiteLink[]
}

export const siteConfig = {
  name: 'No Kings Protest Signs',
  domainLabel: 'BESTNOKINGSPROTESTSIGNS.ORG',
  url: 'https://bestnokingsprotestsigns.org',
  description:
    'Browse No Kings protest signs built for marches, rallies, and printable use. Static launch keeps public voting and new submissions in beta.',
  headerNote: 'A clean wall of No Kings protest signs for marches, rallies, and print-at-home poster making.',
  footerNote:
    'A focused archive of No Kings protest signs with clean layouts, stronger readability, and public write features still in beta for launch.',
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
