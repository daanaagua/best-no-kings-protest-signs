import { describe, expect, it } from 'vitest'

import { POST as postSubmission } from '@/app/api/submissions/route'
import { POST as postVote } from '@/app/api/votes/route'

describe('public write routes', () => {
  it('returns beta-gated responses for public submissions', async () => {
    const response = await postSubmission(
      new Request('https://bestnokingsprotestsigns.org/api/submissions', {
        method: 'POST',
        body: JSON.stringify({ slogan: 'No crowns' }),
      }),
    )

    expect(response.status).toBe(503)
    await expect(response.json()).resolves.toMatchObject({
      error: expect.stringMatching(/disabled during the static launch beta/i),
    })
  })

  it('returns beta-gated responses for public votes', async () => {
    const response = await postVote(
      new Request('https://bestnokingsprotestsigns.org/api/votes', {
        method: 'POST',
        body: JSON.stringify({ slug: 'no-crown-for-a-clown' }),
      }),
    )

    expect(response.status).toBe(503)
    await expect(response.json()).resolves.toMatchObject({
      error: expect.stringMatching(/disabled during the static launch beta/i),
    })
  })
})
