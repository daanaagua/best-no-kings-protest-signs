import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

import { afterEach, describe, expect, it } from 'vitest'

import { createSubmissionStore } from '@/src/lib/submissions/store'

const temporaryDirectories: string[] = []

async function removeDirectoryWithRetry(directory: string) {
  let lastError: unknown

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      await rm(directory, { force: true, recursive: true })
      return
    } catch (error) {
      lastError = error
      await new Promise((resolve) => setTimeout(resolve, 25))
    }
  }

  throw lastError
}

async function createTestStore() {
  const dataDir = await mkdtemp(path.join(os.tmpdir(), 'site-mvp-store-'))
  temporaryDirectories.push(dataDir)

  await writeFile(path.join(dataDir, 'submissions.json'), JSON.stringify({ submissions: [] }, null, 2))
  await writeFile(path.join(dataDir, 'votes.json'), JSON.stringify({ votes: {} }, null, 2))

  return createSubmissionStore({
    dataDir,
    now: () => '2026-03-28T12:00:00.000Z',
    generateId: () => 'submission-fixed-id',
  })
}

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map((directory) => removeDirectoryWithRetry(directory)),
  )
})

describe('submission store', () => {
  it('creates pending submissions and can approve them', async () => {
    const store = await createTestStore()

    const pending = await store.createPendingSubmission({
      slogan: 'No Crown for a Clown',
      slugCandidate: 'no-crown-for-a-clown',
      selectedTemplate: 'classic',
      submitterName: 'Dana',
      submitterEmail: 'dana@example.com',
    })

    expect(pending).toMatchObject({
      id: 'submission-fixed-id',
      status: 'pending',
      slugCandidate: 'no-crown-for-a-clown',
      selectedTemplate: 'classic',
      createdAt: '2026-03-28T12:00:00.000Z',
    })

    const approved = await store.approveSubmission(pending.id)

    expect(approved.status).toBe('approved')

    const approvedItems = await store.listApprovedSubmissions()

    expect(approvedItems).toHaveLength(1)
    expect(approvedItems[0]?.id).toBe(pending.id)

    const persisted = JSON.parse(await readFile(path.join(store.dataDir, 'submissions.json'), 'utf8')) as {
      submissions: Array<{ id: string; status: string }>
    }

    expect(persisted.submissions[0]).toMatchObject({
      id: pending.id,
      status: 'approved',
    })
  })

  it('can reject pending submissions with a moderator note', async () => {
    const store = await createTestStore()

    const pending = await store.createPendingSubmission({
      slogan: 'Reject me',
      slugCandidate: 'reject-me',
      selectedTemplate: 'tilted',
    })

    const rejected = await store.rejectSubmission(pending.id, 'duplicate')

    expect(rejected.status).toBe('rejected')
    expect(rejected.moderatorNote).toBe('duplicate')
  })

  it('does not allow a rejected submission to move back to approved', async () => {
    const store = await createTestStore()

    const pending = await store.createPendingSubmission({
      slogan: 'Already reviewed',
      slugCandidate: 'already-reviewed',
      selectedTemplate: 'classic',
    })

    await store.rejectSubmission(pending.id, 'duplicate')

    await expect(store.approveSubmission(pending.id)).rejects.toThrow(/pending/i)
  })

  it('stores vote counts in votes.json', async () => {
    const store = await createTestStore()

    const nextVoteCount = await store.incrementVoteCount('no-crown-for-a-clown', 942)

    expect(nextVoteCount).toBe(943)
    expect(await store.getVoteCount('no-crown-for-a-clown')).toBe(943)

    const persisted = JSON.parse(await readFile(path.join(store.dataDir, 'votes.json'), 'utf8')) as {
      votes: Record<string, number>
    }

    expect(persisted.votes['no-crown-for-a-clown']).toBe(943)
  })

  it('serializes concurrent vote increments so updates are not lost', async () => {
    const store = await createTestStore()

    await Promise.all([
      store.incrementVoteCount('hot-sign', 0),
      store.incrementVoteCount('hot-sign', 0),
      store.incrementVoteCount('hot-sign', 0),
    ])

    expect(await store.getVoteCount('hot-sign')).toBe(3)
  })

  it('assigns a deterministic unique slug when approval collides with a public slug', async () => {
    const store = await createTestStore()

    const pending = await store.createPendingSubmission({
      slogan: 'No Crown for a Clown',
      slugCandidate: 'no-crown-for-a-clown',
      selectedTemplate: 'classic',
    })

    const approved = await store.approveSubmission(pending.id)

    expect(approved.slugCandidate).toBe('no-crown-for-a-clown-2')
  })

  it('avoids collisions with already-public seed community slugs during approval', async () => {
    const store = await createTestStore()

    const pending = await store.createPendingSubmission({
      slogan: 'Library Cards Over Crowns',
      slugCandidate: 'community-library-cards-over-crowns',
      selectedTemplate: 'classic',
    })

    const approved = await store.approveSubmission(pending.id)

    expect(approved.slugCandidate).toBe('community-library-cards-over-crowns-2')
  })
})
