import { describe, expect, it } from 'vitest'

import { POST as postSubmission } from '@/app/api/submissions/route'
import { POST as postVote } from '@/app/api/votes/route'

describe('public write routes', () => {
  it('returns beta-gated responses for public submissions', async () => {
    const response = await postSubmission()

    expect(response.status).toBe(503)
    await expect(response.json()).resolves.toMatchObject({
      error: expect.stringMatching(/disabled during the static launch beta/i),
    })
  })

  it('returns beta-gated responses for public votes', async () => {
    const response = await postVote()

    expect(response.status).toBe(503)
    await expect(response.json()).resolves.toMatchObject({
      error: expect.stringMatching(/disabled during the static launch beta/i),
    })
  })
})
