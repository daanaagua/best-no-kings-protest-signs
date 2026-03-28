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

  it('returns normalized data for a valid submission', () => {
    const result = validateSubmission({
      slogan: '  Let voters steer  ',
      selectedTemplate: 'bold-marker',
      submitterName: '  Dana  ',
      submitterEmail: ' DANA@example.com ',
      acceptedPolicy: true,
      confirmedOwnership: true,
    })

    expect(result.success).toBe(true)

    if (!result.success) {
      throw new Error('expected validation to succeed')
    }

    expect(result.value).toMatchObject({
      slogan: 'Let voters steer',
      slugCandidate: 'let-voters-steer',
      selectedTemplate: 'bold-marker',
      submitterName: 'Dana',
      submitterEmail: 'dana@example.com',
    })
  })
})
