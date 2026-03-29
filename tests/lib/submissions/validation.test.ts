import { describe, expect, it } from 'vitest'

import { validateSubmission } from '@/src/lib/submissions/validation'

describe('validateSubmission', () => {
  it('rejects an empty slogan', () => {
    const result = validateSubmission({
      slogan: '',
      selectedTemplate: 'classic',
      acceptedPolicy: true,
      confirmedOwnership: true,
    })

    expect(result.success).toBe(false)
    expect(result.errors.slogan).toMatch(/enter a slogan/i)
  })

  it('requires policy and ownership confirmation', () => {
    const result = validateSubmission({
      slogan: 'No Crown for a Clown',
      selectedTemplate: 'classic',
      acceptedPolicy: false,
      confirmedOwnership: false,
    })

    expect(result.success).toBe(false)
    expect(result.errors.acceptedPolicy).toMatch(/policy/i)
    expect(result.errors.confirmedOwnership).toMatch(/ownership/i)
  })

  it('rejects slogans that cannot produce a usable slug candidate', () => {
    const result = validateSubmission({
      slogan: '!!!!',
      selectedTemplate: 'classic',
      acceptedPolicy: true,
      confirmedOwnership: true,
    })

    expect(result.success).toBe(false)
    expect(result.errors.slogan).toMatch(/usable slug/i)
  })

  it('returns normalized data for a valid submission', () => {
    const submission = {
      slogan: '  Let voters steer  ',
      selectedTemplate: 'bold-marker',
      submitterName: '  Dana  ',
      submitterEmail: ' DANA@example.com ',
      selectedTextColor: 'signal-red',
      textRotation: 8,
      textOffsetY: 12,
      textScale: 1.14,
      acceptedPolicy: true,
      confirmedOwnership: true,
    }
    const result = validateSubmission(submission)

    expect(result.success).toBe(true)

    if (!result.success) {
      throw new Error('expected validation to succeed')
    }

    expect(result.value).toMatchObject({
      slogan: 'Let voters steer',
      slugCandidate: 'let-voters-steer',
      selectedTemplate: 'bold-marker',
      primaryCategory: 'printable',
      categories: ['printable'],
      submitterName: 'Dana',
      submitterEmail: 'dana@example.com',
      selectedTextColor: 'signal-red',
      textRotation: 8,
      textOffsetY: 12,
      textScale: 1.14,
    })
  })

  it('rejects style values outside the UI slider ranges', () => {
    const result = validateSubmission({
      slogan: 'Keep it local',
      selectedTemplate: 'classic',
      textRotation: 31,
      textOffsetY: -33,
      textScale: 1.21,
      acceptedPolicy: true,
      confirmedOwnership: true,
    })

    expect(result.success).toBe(false)
    expect(result.errors.textRotation).toMatch(/-30/i)
    expect(result.errors.textOffsetY).toMatch(/-32/i)
    expect(result.errors.textScale).toMatch(/0.8/i)
  })

  it('rejects unsupported text color ids', () => {
    const result = validateSubmission({
      slogan: 'Keep it local',
      selectedTemplate: 'classic',
      selectedTextColor: 'hot-pink',
      acceptedPolicy: true,
      confirmedOwnership: true,
    })

    expect(result.success).toBe(false)
    expect(result.errors.selectedTextColor).toMatch(/text color/i)
  })

  it('rejects an explicitly empty text color id', () => {
    const result = validateSubmission({
      slogan: 'Keep it local',
      selectedTemplate: 'classic',
      selectedTextColor: '',
      acceptedPolicy: true,
      confirmedOwnership: true,
    })

    expect(result.success).toBe(false)
    expect(result.errors.selectedTextColor).toMatch(/text color/i)
  })
})
