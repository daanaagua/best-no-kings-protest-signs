import { describe, expect, it } from 'vitest'

import {
  buildCategoryMetadata,
  buildHomeMetadata,
  buildSignMetadata,
  buildTopMetadata,
} from '@/src/lib/signs/metadata'

describe('metadata helpers', () => {
  it('builds the exact homepage metadata', () => {
    expect(buildHomeMetadata()).toMatchObject({
      title: 'Best No Kings Protest Signs for Marches, Rallies, and Printouts',
      description:
        'Find the best No Kings protest signs for marches, rallies, printouts, and community uploads, with one homepage that surfaces the strongest slogans first.',
      keywords: expect.arrayContaining([
        'no kings protest signs',
        'best no kings protest signs',
        'protest sign ideas',
      ]),
    })

    expect(buildHomeMetadata().title).not.toMatch(/funny/i)
    expect(buildHomeMetadata().description).not.toMatch(/funny/i)
  })

  it('builds the exact category metadata', () => {
    expect(buildCategoryMetadata('best')).toMatchObject({
      title: 'Best No Kings Sign Ideas for Rally Posters',
      description:
        'Browse best No Kings sign ideas for rally posters, compare printable picks, and move back to the homepage hub for the full sign wall.',
      keywords: expect.arrayContaining(['best no kings sign ideas', 'best protest sign ideas']),
    })
  })

  it('builds a distinct top-page title and description', () => {
    expect(buildTopMetadata('printable')).toMatchObject({
      title: 'Top Printable No Kings Signs for Fast Printing',
      description:
        'See the strongest printable No Kings signs ranked for fast printing, then return to the homepage for the broader archive.',
      keywords: expect.arrayContaining(['top printable no kings signs', 'best printable protest signs']),
    })
    expect(buildCategoryMetadata('printable').title).not.toBe(buildTopMetadata('printable').title)
    expect(buildTopMetadata('printable').description).not.toMatch(/funny/i)
  })

  it('builds the exact sign detail metadata', () => {
    expect(buildSignMetadata({ title: 'No Crown for a Clown' })).toMatchObject({
      title: 'No Crown for a Clown | No Kings Protest Sign',
      description:
        'View this No Kings protest sign, download it as a PNG, share it, and explore related readable, printable, or approved community signs.',
      keywords: expect.arrayContaining(['No Crown for a Clown', 'no kings protest sign']),
    })
  })

  it('trims surrounding whitespace from sign titles before building detail metadata', () => {
    expect(buildSignMetadata({ title: '  No Crown for a Clown  ' })).toMatchObject({
      title: 'No Crown for a Clown | No Kings Protest Sign',
      description:
        'View this No Kings protest sign, download it as a PNG, share it, and explore related readable, printable, or approved community signs.',
      keywords: expect.arrayContaining(['No Crown for a Clown', 'no kings protest sign']),
    })
  })

  it('keeps community attribution and private submission fields out of detail metadata', () => {
    const metadata = buildSignMetadata({
      title: 'Town Hall Over Throne Room',
      submitterName: 'Dana Rivers',
      submitterEmail: 'dana@example.com',
      moderatorNote: 'Ready for the gallery',
    })

    expect(metadata).toMatchObject({
      title: 'Town Hall Over Throne Room | No Kings Protest Sign',
      description:
        'View this No Kings protest sign, download it as a PNG, share it, and explore related readable, printable, or approved community signs.',
    })
    expect(JSON.stringify(metadata)).not.toMatch(/Dana Rivers|dana@example.com|Ready for the gallery/i)
  })
})
