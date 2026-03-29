import { siteConfig } from '@/src/data/site'

const content = `# No Kings Protest Signs

> No Kings Protest Signs is a visual archive and lightweight sign-making tool for anti-authoritarian protest sign ideas, official sign artwork, community-ready rally messaging, and PNG exports.

## Docs

- [Homepage](${siteConfig.url}/): Main sign wall with featured official signs, newer community sign ideas, and a direct route into the submit builder.
- [Submit Editor](${siteConfig.url}/submit): Interactive sign-making page where users can choose white-board templates, adjust slogan color, rotation, vertical position, and scale, then export PNGs.
- [About](${siteConfig.url}/about): Overview of the site mission, launch direction, and archive purpose.
- [Content Policy](${siteConfig.url}/content-policy): Publishing rules, moderation expectations, and launch constraints.

## Sign Examples

- [No Crown for a Clown](${siteConfig.url}/signs/no-crown-for-a-clown): Official sign artwork using concise anti-monarchy wording and a straightforward protest-board presentation.
- [Democracy Looks Better on Us](${siteConfig.url}/signs/democracy-looks-better-on-us): Official sign artwork using a civic-forward slogan with restrained red emphasis.
- [Liberty Doesn\'t Bow](${siteConfig.url}/signs/liberty-doesnt-bow): Official sign artwork showing a more serious tone and simple two-line board design.
- [Power Belongs to the Public](${siteConfig.url}/signs/power-belongs-to-the-public): Official sign artwork focused on broad public-democracy language.
- [Rule of Law Not Rule by Heir](${siteConfig.url}/signs/rule-of-law-not-rule-by-heir): Official sign artwork using a longer phrase with emphasis on constitutional wording.

## Topic Pages

- [Best No Kings Protest Sign Ideas](${siteConfig.url}/topics/no-kings/best): Topic page for stronger broad-appeal civic signs.
- [Kids No Kings Protest Sign Ideas](${siteConfig.url}/topics/no-kings/kids): Topic page for simpler, family-friendly sign concepts.
- [Printable No Kings Protest Sign Ideas](${siteConfig.url}/topics/no-kings/printable): Topic page for cleaner board-first layouts.
- [Top Best No Kings Protest Signs](${siteConfig.url}/topics/no-kings/top/best): Ranked list of leading broad-appeal No Kings signs.
- [Top Printable No Kings Protest Signs](${siteConfig.url}/topics/no-kings/top/printable): Ranked list of leading printable No Kings signs.

## Key Facts

- Domain: ${siteConfig.url}
- Primary topic: No Kings protest signs
- Main user jobs: browse sign ideas, view sign artwork, download PNGs, and build new slogans on blank board templates
- Artwork model: official signs use generated protest-board imagery; the sign maker uses blank white-board template images with text overlays
- Public site behavior: browsing, sharing, and PNG exports are all available on public routes

## Contact

- Website: ${siteConfig.url}
- About: ${siteConfig.url}/about
- Content policy: ${siteConfig.url}/content-policy
- Privacy: ${siteConfig.url}/privacy-policy
- Terms: ${siteConfig.url}/terms
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
