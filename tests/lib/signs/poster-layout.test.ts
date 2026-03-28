import { describe, expect, it } from 'vitest'

import { buildPosterLayoutLines } from '@/src/lib/signs/poster-layout'

describe('buildPosterLayoutLines', () => {
  it('keeps longer protest titles within four balanced lines', () => {
    const lines = buildPosterLayoutLines('Keep Your Tiara Out of My Tax Bracket')

    expect(lines.length).toBeLessThanOrEqual(4)
    expect(lines.join(' ')).toContain('Keep Your Tiara')
    expect(lines.join(' ')).toContain('Tax Bracket')
  })

  it('breaks long unbroken words so text cannot spill outside the sign', () => {
    const lines = buildPosterLayoutLines('Pneumonoultramicroscopicsilicovolcanoconiosis')

    expect(lines.length).toBeGreaterThan(1)
    expect(lines.every((line) => line.length <= 14)).toBe(true)
  })
})
