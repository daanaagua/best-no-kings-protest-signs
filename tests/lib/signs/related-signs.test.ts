import { describe, expect, it } from 'vitest'

import { getRelatedSigns } from '@/src/lib/signs/queries'

describe('related sign queries', () => {
  it('returns same-category items excluding the current sign', () => {
    const related = getRelatedSigns('no-crown-for-a-clown', 'funny', 3)

    expect(related).toHaveLength(3)
    expect(related.some((sign) => sign.slug === 'no-crown-for-a-clown')).toBe(false)
    expect(related.every((sign) => sign.categories.includes('funny'))).toBe(true)
  })
})
