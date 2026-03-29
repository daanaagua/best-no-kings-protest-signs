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
      title: 'Best No Kings Protest Signs, Funny Ideas & Community Uploads',
      description:
        'Browse the best No Kings protest signs, funny sign ideas, printable slogans, and approved community designs for marches, rallies, and fast PNG downloads.',
      keywords: expect.arrayContaining([
        'no kings protest signs',
        'best no kings protest signs',
        'protest sign ideas',
      ]),
    })
  })

  it('builds the exact category metadata', () => {
    expect(buildCategoryMetadata('funny')).toMatchObject({
      title: 'Funny No Kings Protest Sign Ideas',
      description:
        'Browse funny No Kings protest sign ideas, explore related printable picks, and open ready-to-share artwork from the wider archive.',
      keywords: expect.arrayContaining(['funny no kings protest sign ideas', 'funny protest signs']),
    })
  })

  it('builds a distinct top-page title and description', () => {
    expect(buildTopMetadata('funny')).toMatchObject({
      title: 'Top Funny No Kings Protest Signs',
      description:
        'See the strongest funny No Kings protest signs ranked from launch scoring and editorial picks.',
      keywords: expect.arrayContaining(['top funny no kings protest signs', 'best funny protest signs']),
    })
    expect(buildCategoryMetadata('funny').title).not.toBe(buildTopMetadata('funny').title)
  })

  it('builds the exact sign detail metadata', () => {
    expect(buildSignMetadata({ title: 'No Crown for a Clown' })).toMatchObject({
      title: 'No Crown for a Clown | No Kings Protest Sign',
      description:
        'View this No Kings protest sign, download it as a PNG, share it, and explore related funny, printable, or approved community signs.',
      keywords: expect.arrayContaining(['No Crown for a Clown', 'no kings protest sign']),
    })
  })

  it('trims surrounding whitespace from sign titles before building detail metadata', () => {
    expect(buildSignMetadata({ title: '  No Crown for a Clown  ' })).toMatchObject({
      title: 'No Crown for a Clown | No Kings Protest Sign',
      description:
        'View this No Kings protest sign, download it as a PNG, share it, and explore related funny, printable, or approved community signs.',
      keywords: expect.arrayContaining(['No Crown for a Clown', 'no kings protest sign']),
    })
  })
})
