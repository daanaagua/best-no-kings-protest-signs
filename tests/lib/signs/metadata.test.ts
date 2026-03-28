import { describe, expect, it } from 'vitest'

import {
  buildCategoryMetadata,
  buildHomeMetadata,
  buildSignMetadata,
  buildTopMetadata,
} from '@/src/lib/signs/metadata'

describe('metadata helpers', () => {
  it('builds the exact homepage metadata', () => {
    expect(buildHomeMetadata()).toEqual({
      title: 'Best No Kings Protest Signs, Funny Ideas & Community Uploads',
      description:
        'Browse the best No Kings protest signs, funny sign ideas, printable slogans, and community-submitted designs. Vote on favorites or submit your own sign.',
    })
  })

  it('builds the exact category metadata', () => {
    expect(buildCategoryMetadata('funny')).toEqual({
      title: 'Funny No Kings Protest Sign Ideas',
      description:
        'Browse funny No Kings protest sign ideas, vote on favorites, and discover related printable and community-created signs.',
    })
  })

  it('builds a distinct top-page title and description', () => {
    expect(buildTopMetadata('funny')).toEqual({
      title: 'Top Funny No Kings Protest Signs',
      description:
        'See the most popular funny No Kings protest signs ranked by votes and editorial picks.',
    })
    expect(buildCategoryMetadata('funny').title).not.toBe(buildTopMetadata('funny').title)
  })

  it('builds the exact sign detail metadata', () => {
    expect(buildSignMetadata({ title: 'No Crown for a Clown' })).toEqual({
      title: 'No Crown for a Clown | No Kings Protest Sign',
      description:
        'View this No Kings protest sign, vote on it, and explore related funny, printable, or community-submitted signs.',
    })
  })
})
