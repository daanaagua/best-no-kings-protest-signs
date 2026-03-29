import { siteConfig } from '@/src/data/site'

const content = `# No Kings Protest Signs

> No Kings Protest Signs is a visual archive of anti-authoritarian protest signs, sign inspiration, printable-style boards, and a browser-based sign maker for creating new rally slogans.

## Docs

- [Homepage](${siteConfig.url}/): Main gallery of featured No Kings protest signs, recent community additions, and the strongest official sign artwork.
- [Submit Editor](${siteConfig.url}/submit): Blank board templates plus controls for slogan text, rotation, color, size, and position, with instant PNG export.
- [No Crown for a Clown](${siteConfig.url}/signs/no-crown-for-a-clown): Example official sign detail page showing full-size artwork, PNG download, sharing, and related signs.
- [People Over Pageantry](${siteConfig.url}/signs/people-over-pageantry): Example of a serious civic sign with restrained color emphasis.
- [We the People Not the Palace](${siteConfig.url}/signs/we-the-people-not-we-the-palace): Example long-line sign designed for high readability.

## Resources

- [Best No Kings Protest Sign Ideas](${siteConfig.url}/topics/no-kings/best): Cluster page for broad-appeal No Kings signs and civic messaging.
- [Kids No Kings Protest Sign Ideas](${siteConfig.url}/topics/no-kings/kids): Cluster page for simpler, family-friendly No Kings signs.
- [Printable No Kings Protest Sign Ideas](${siteConfig.url}/topics/no-kings/printable): Cluster page for cleaner, poster-like sign formats and printable wording.
- [Top Best No Kings Protest Signs](${siteConfig.url}/topics/no-kings/top/best): Ranking page showing the highest-scoring general-interest protest signs.
- [Top Printable No Kings Protest Signs](${siteConfig.url}/topics/no-kings/top/printable): Ranking page showing the highest-scoring printable protest signs.

## Key Facts

- Domain: ${siteConfig.url}
- Focus: No Kings protest signs, rally sign inspiration, printable sign concepts, and browser-based sign making.
- Format: Official Seedream-based sign artwork plus approved community sign entries.
- Tooling: Visitors can browse sign detail pages, open the sign builder, and export sign artwork as PNG files.

## Contact

- Website: ${siteConfig.url}
- About: ${siteConfig.url}/about
- Content policy: ${siteConfig.url}/content-policy
- Privacy: ${siteConfig.url}/privacy-policy
`

export async function GET() {
  return new Response(content, {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'public, max-age=3600',
    },
  })
}

export default GET
