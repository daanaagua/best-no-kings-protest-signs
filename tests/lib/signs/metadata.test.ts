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
      title: 'Best No Kings Protest Signs, Printable Ideas & Community Uploads',
      description:
        'Browse the best No Kings protest signs, printable slogans, readable sign ideas, and approved community designs for marches, rallies, and fast PNG downloads.',
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
      title: 'Best No Kings Protest Sign Ideas',
      description:
        'Browse best No Kings protest sign ideas, explore related printable picks, and open ready-to-share artwork from the wider archive.',
      keywords: expect.arrayContaining(['best no kings protest sign ideas', 'best protest signs']),
    })
  })

  it('builds a distinct top-page title and description', () => {
    expect(buildTopMetadata('printable')).toMatchObject({
      title: 'Top Printable No Kings Protest Signs',
      description:
        'See the strongest printable No Kings protest signs ranked from launch scoring and editorial picks.',
      keywords: expect.arrayContaining(['top printable no kings protest signs', 'best printable protest signs']),
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
})
