import { describe, expect, it } from 'vitest'

import { getRelatedSigns } from '@/src/lib/signs/queries'

describe('related sign queries', () => {
  it('returns same-category items excluding the current sign', () => {
    const related = getRelatedSigns('no-crown-for-a-clown', 'best', 3)

    expect(related).toHaveLength(3)
    expect(related.some((sign) => sign.slug === 'no-crown-for-a-clown')).toBe(false)
    expect(related.every((sign) => sign.categories.includes('best'))).toBe(true)
    expect(related.every((sign) => sign.sourceType === 'official')).toBe(true)
    expect(related.some((sign) => sign.slug.startsWith('community-'))).toBe(false)
  })

  it('returns no related signs when the current slug does not exist', () => {
    expect(getRelatedSigns('missing-sign-slug', 'best', 3)).toEqual([])
  })
})
