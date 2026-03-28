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
        'Browse the best No Kings protest signs, funny sign ideas, printable slogans, and approved community designs. Static launch keeps public voting and new submissions in beta.',
    })
  })

  it('builds the exact category metadata', () => {
    expect(buildCategoryMetadata('funny')).toEqual({
      title: 'Funny No Kings Protest Sign Ideas',
      description:
        'Browse funny No Kings protest sign ideas, explore related printable picks, and preview where approved community signs fit into the static launch archive.',
    })
  })

  it('builds a distinct top-page title and description', () => {
    expect(buildTopMetadata('funny')).toEqual({
      title: 'Top Funny No Kings Protest Signs',
      description:
        'See the strongest funny No Kings protest signs ranked from launch scoring and editorial picks.',
    })
    expect(buildCategoryMetadata('funny').title).not.toBe(buildTopMetadata('funny').title)
  })

  it('builds the exact sign detail metadata', () => {
    expect(buildSignMetadata({ title: 'No Crown for a Clown' })).toEqual({
      title: 'No Crown for a Clown | No Kings Protest Sign',
      description:
        'View this No Kings protest sign, share it, and explore related funny, printable, or approved community signs.',
    })
  })

  it('trims surrounding whitespace from sign titles before building detail metadata', () => {
    expect(buildSignMetadata({ title: '  No Crown for a Clown  ' })).toEqual({
      title: 'No Crown for a Clown | No Kings Protest Sign',
      description:
        'View this No Kings protest sign, share it, and explore related funny, printable, or approved community signs.',
    })
  })
})
