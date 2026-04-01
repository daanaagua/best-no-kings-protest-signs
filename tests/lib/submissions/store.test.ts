import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

import { afterEach, describe, expect, it } from 'vitest'

import {
  createBlankBoardDocument,
  createTextLayer,
} from '@/src/lib/signs/board-document'
import {
  buildApprovedSubmissionSign,
  createSubmissionStore,
} from '@/src/lib/submissions/store'

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

function decodeSvgAsset(dataUrl: string) {
  return decodeURIComponent(dataUrl.replace('data:image/svg+xml;charset=UTF-8,', ''))
}

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map((directory) => removeDirectoryWithRetry(directory)),
  )
})

describe('submission store', () => {
  it('stores a board document and restores it on read', async () => {
    const store = await createTestStore()
    const boardDocument = createBlankBoardDocument()
    boardDocument.layers = [createTextLayer({ text: 'Power to the Public' })]

    const pending = await store.createPendingSubmission({
      slogan: 'Power to the Public',
      slugCandidate: 'power-to-the-public',
      selectedTemplate: 'blank-white',
      primaryCategory: 'printable',
      categories: ['printable', 'best'],
      boardDocument,
      submissionAssets: [
        {
          id: 'asset-1',
          mimeType: 'image/png',
          originalFileName: 'poster.png',
          storageType: 'inline-data-url',
          dataUrl: 'data:image/png;base64,abc123',
          fileSizeBytes: 1024,
          naturalWidth: 1200,
          naturalHeight: 900,
        },
      ],
    })

    const [saved] = await store.listPendingSubmissions()

    expect(saved?.boardDocument).toEqual(pending.boardDocument)
    expect(saved?.submissionAssets[0]?.id).toBe('asset-1')
  })

  it('converts a legacy record without boardDocument into a one-text-layer board on read', async () => {
    const dataDir = await mkdtemp(path.join(os.tmpdir(), 'site-mvp-store-'))
    temporaryDirectories.push(dataDir)

    await writeFile(
      path.join(dataDir, 'submissions.json'),
      JSON.stringify(
        {
          submissions: [
            {
              id: 'legacy-submission',
              slogan: 'Legacy board',
              slugCandidate: 'legacy-board',
              selectedTemplate: 'classic',
              status: 'approved',
              createdAt: '2026-03-28T12:00:00.000Z',
            },
          ],
        },
        null,
        2,
      ),
    )
    await writeFile(path.join(dataDir, 'votes.json'), JSON.stringify({ votes: {} }, null, 2))

    const store = createSubmissionStore({
      dataDir,
      now: () => '2026-03-28T12:00:00.000Z',
      generateId: () => 'unused',
    })

    const [legacy] = await store.listApprovedSubmissions()

    expect(legacy?.boardDocument.layers[0]).toMatchObject({
      type: 'text',
      text: 'Legacy board',
    })
  })

  it('creates pending submissions and can approve them', async () => {
    const store = await createTestStore()

    const draft = {
      slogan: 'No Crown for a Clown',
      slugCandidate: 'no-crown-for-a-clown',
      selectedTemplate: 'classic',
      primaryCategory: 'best',
      categories: ['best', 'printable'],
      submitterName: 'Dana',
      submitterEmail: 'dana@example.com',
      selectedTextColor: 'signal-red',
      textRotation: 8,
      textOffsetY: 12,
      textScale: 1.14,
    }
    const pending = await store.createPendingSubmission(draft)

    expect(pending).toMatchObject({
      id: 'submission-fixed-id',
      status: 'pending',
      slugCandidate: 'no-crown-for-a-clown',
      selectedTemplate: 'classic',
      primaryCategory: 'best',
      categories: ['best', 'printable'],
      selectedTextColor: 'signal-red',
      textRotation: 8,
      textOffsetY: 12,
      textScale: 1.14,
      createdAt: '2026-03-28T12:00:00.000Z',
    })

    const approved = await store.approveSubmission(pending.id)

    expect(approved.status).toBe('approved')
    expect(approved.approvedAt).toBe('2026-03-28T12:00:00.000Z')

    const approvedItems = await store.listApprovedSubmissions()

    expect(approvedItems).toHaveLength(1)
    expect(approvedItems[0]?.id).toBe(pending.id)

    const persisted = JSON.parse(await readFile(path.join(store.dataDir, 'submissions.json'), 'utf8')) as {
      submissions: Array<{ id: string; status: string; approvedAt?: string }>
    }

    expect(persisted.submissions[0]).toMatchObject({
      id: pending.id,
      status: 'approved',
      approvedAt: '2026-03-28T12:00:00.000Z',
    })
  })

  it('can reject pending submissions with a moderator note', async () => {
    const store = await createTestStore()

    const pendingDraft = {
      slogan: 'Reject me',
      slugCandidate: 'reject-me',
      selectedTemplate: 'tilted',
      primaryCategory: 'best',
      categories: ['best'],
      selectedTextColor: 'charcoal',
      textRotation: 0,
      textOffsetY: 0,
      textScale: 1,
    }
    const pending = await store.createPendingSubmission(pendingDraft)

    const rejected = await store.rejectSubmission(pending.id, 'duplicate')

    expect(rejected.status).toBe('rejected')
    expect(rejected.moderatorNote).toBe('duplicate')
    expect(rejected.approvedAt).toBeUndefined()
  })

  it('does not allow a rejected submission to move back to approved', async () => {
    const store = await createTestStore()

    const pendingDraft = {
      slogan: 'Already reviewed',
      slugCandidate: 'already-reviewed',
      selectedTemplate: 'classic',
      primaryCategory: 'best',
      categories: ['best', 'printable'],
      selectedTextColor: 'charcoal',
      textRotation: 0,
      textOffsetY: 0,
      textScale: 1,
    }
    const pending = await store.createPendingSubmission(pendingDraft)

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

    const pendingDraft = {
      slogan: 'No Crown for a Clown',
      slugCandidate: 'no-crown-for-a-clown',
      selectedTemplate: 'classic',
      primaryCategory: 'best',
      categories: ['best', 'printable'],
      selectedTextColor: 'charcoal',
      textRotation: 0,
      textOffsetY: 0,
      textScale: 1,
    }
    const pending = await store.createPendingSubmission(pendingDraft)

    const approved = await store.approveSubmission(pending.id)

    expect(approved.slugCandidate).toBe('no-crown-for-a-clown-2')
  })

  it('does not treat legacy seeded community slugs as public collisions during approval', async () => {
    const store = await createTestStore()

    const pendingDraft = {
      slogan: 'Library Cards Over Crowns',
      slugCandidate: 'community-library-cards-over-crowns',
      selectedTemplate: 'classic',
      primaryCategory: 'best',
      categories: ['best', 'printable'],
      selectedTextColor: 'charcoal',
      textRotation: 0,
      textOffsetY: 0,
      textScale: 1,
    }
    const pending = await store.createPendingSubmission(pendingDraft)

    const approved = await store.approveSubmission(pending.id)

    expect(approved.slugCandidate).toBe('community-library-cards-over-crowns')
  })

  it('builds a public community sign without leaking private submission fields', async () => {
    const store = await createTestStore()

    const draft = {
      slogan: 'Power to the Public',
      slugCandidate: 'power-to-the-public',
      selectedTemplate: 'tilted',
      primaryCategory: 'best',
      categories: ['best'],
      submitterEmail: 'dana@example.com',
      selectedTextColor: 'signal-red',
      textRotation: 8,
      textOffsetY: 12,
      textScale: 1.14,
    }

    const pending = await store.createPendingSubmission(draft)
    const approved = await store.approveSubmission(pending.id, 'ready for gallery')
    const sign = buildApprovedSubmissionSign(approved, 7)
    const svg = decodeSvgAsset(sign.image)

    expect(sign).not.toHaveProperty('submitterEmail')
    expect(sign).not.toHaveProperty('moderatorNote')
    expect(svg).toContain('fill="#b42318"')
    expect(svg).toContain('rotate(8 400 512)')
  })

  it('keeps the template default text color for legacy records without a stored color id', async () => {
    const dataDir = await mkdtemp(path.join(os.tmpdir(), 'site-mvp-store-'))
    temporaryDirectories.push(dataDir)

    await writeFile(
      path.join(dataDir, 'submissions.json'),
      JSON.stringify(
        {
          submissions: [
            {
              id: 'submission-legacy-printable',
              slogan: 'Poster power',
              slugCandidate: 'poster-power',
              selectedTemplate: 'printable',
              status: 'approved',
              createdAt: '2026-03-28T12:00:00.000Z',
            },
          ],
        },
        null,
        2,
      ),
    )
    await writeFile(path.join(dataDir, 'votes.json'), JSON.stringify({ votes: {} }, null, 2))

    const store = createSubmissionStore({
      dataDir,
      now: () => '2026-03-28T12:00:00.000Z',
      generateId: () => 'submission-fixed-id',
    })

    const approved = (await store.listApprovedSubmissions())[0]

    expect(approved).toBeDefined()

    const sign = buildApprovedSubmissionSign(approved!, 0)
    const svg = decodeSvgAsset(sign.image)

    expect(svg).toContain('fill="#111111"')
    expect(svg).not.toContain('fill="#171717"')
  })

  it('prefers D1-backed async reads when a binding is available', async () => {
    const store = await createTestStore()

    const d1Statements = new Map<string, { results?: unknown[]; first?: unknown }>([
      [
        'SELECT id, slogan, slug_candidate, selected_template, primary_category, categories_json, submitter_name, submitter_email, selected_text_color, text_rotation, text_offset_y, text_scale, board_document_json, submission_assets_json, status, created_at, approved_at, moderator_note FROM submissions WHERE status = ? ORDER BY datetime(created_at) DESC, id DESC',
        {
          results: [
            {
              id: 'submission-from-d1',
              slogan: 'From D1 only',
              slug_candidate: 'from-d1-only',
              selected_template: 'classic',
              primary_category: 'best',
              categories_json: JSON.stringify(['best', 'printable']),
              submitter_name: 'Dana',
              submitter_email: 'dana@example.com',
              selected_text_color: 'signal-red',
              text_rotation: 4,
              text_offset_y: 6,
              text_scale: 1.1,
              status: 'approved',
              created_at: '2026-03-29T09:00:00.000Z',
              approved_at: '2026-03-29T10:00:00.000Z',
              moderator_note: 'ready',
            },
          ],
        },
      ],
    ])

    const storeWithD1 = createSubmissionStore({
      dataDir: store.dataDir,
      now: () => '2026-03-28T12:00:00.000Z',
      generateId: () => 'submission-fixed-id',
      getD1Database: async () => ({
        prepare(sql: string) {
          const statement = d1Statements.get(sql)

          if (!statement) {
            throw new Error(`Unexpected SQL in test: ${sql}`)
          }

          return {
            bind() {
              return this
            },
            async all() {
              return {
                results: statement.results ?? [],
              }
            },
            async first() {
              return (statement.first ?? null) as never
            },
            async run() {
              return {}
            },
          }
        },
      }),
    })

    const approvedItems = await storeWithD1.listApprovedSubmissions()

    expect(approvedItems).toHaveLength(1)
    expect(approvedItems[0]?.id).toBe('submission-from-d1')
    expect(approvedItems[0]?.slugCandidate).toBe('from-d1-only')
  })

  it('retries D1 approval with a new slug when the approved slug hits a unique constraint', async () => {
    const store = await createTestStore()
    const attemptedSlugs: string[] = []
    let approvedSlugReads = 0
    let lastBoundValues: unknown[] = []

    const storeWithD1 = createSubmissionStore({
      dataDir: store.dataDir,
      now: () => '2026-03-28T12:00:00.000Z',
      generateId: () => 'submission-fixed-id',
      getD1Database: async () => ({
        prepare(sql: string) {
          return {
            bind(...values: unknown[]) {
              lastBoundValues = values
              return this
            },
            async all() {
              if (
                sql ===
                'SELECT slug_candidate FROM submissions WHERE status = ? AND id != ?'
              ) {
                approvedSlugReads += 1

                return {
                  results:
                    approvedSlugReads === 1
                      ? []
                      : [{ slug_candidate: 'same-slug' }],
                }
              }

              throw new Error(`Unexpected SQL all() in test: ${sql}`)
            },
            async first() {
              if (
                sql ===
                'SELECT id, slogan, slug_candidate, selected_template, primary_category, categories_json, submitter_name, submitter_email, selected_text_color, text_rotation, text_offset_y, text_scale, board_document_json, submission_assets_json, status, created_at, approved_at, moderator_note FROM submissions WHERE id = ?'
              ) {
                return {
                  id: 'submission-from-d1',
                  slogan: 'Same slug please',
                  slug_candidate: 'same-slug',
                  selected_template: 'classic',
                  primary_category: 'best',
                  categories_json: JSON.stringify(['best']),
                  submitter_name: 'Dana',
                  submitter_email: 'dana@example.com',
                  selected_text_color: 'charcoal',
                  text_rotation: 0,
                  text_offset_y: 0,
                  text_scale: 1,
                  status: 'pending',
                  created_at: '2026-03-28T11:00:00.000Z',
                  approved_at: null,
                  moderator_note: null,
                }
              }

              throw new Error(`Unexpected SQL first() in test: ${sql}`)
            },
            async run() {
              if (
                sql ===
                'UPDATE submissions SET slug_candidate = ?, status = ?, approved_at = ?, moderator_note = ? WHERE id = ?'
              ) {
                attemptedSlugs.push(String(lastBoundValues[0]))

                if (attemptedSlugs.length === 1) {
                  throw new Error('D1_ERROR: UNIQUE constraint failed: submissions.slug_candidate')
                }

                return {}
              }

              throw new Error(`Unexpected SQL run() in test: ${sql}`)
            },
          }
        },
      }),
    })

    const approved = await storeWithD1.approveSubmission('submission-from-d1')

    expect(approved.slugCandidate).toBe('same-slug-2')
    expect(attemptedSlugs).toEqual(['same-slug', 'same-slug-2'])
  })

  it('falls back to file storage when no D1 binding is available', async () => {
    const store = await createTestStore()

    const pending = await store.createPendingSubmission({
      slogan: 'Fallback path',
      slugCandidate: 'fallback-path',
      selectedTemplate: 'classic',
      primaryCategory: 'best',
      categories: ['best'],
      selectedTextColor: 'charcoal',
      textRotation: 0,
      textOffsetY: 0,
      textScale: 1,
    })

    await store.approveSubmission(pending.id)

    const storeWithoutD1 = createSubmissionStore({
      dataDir: store.dataDir,
      now: () => '2026-03-28T12:00:00.000Z',
      generateId: () => 'submission-fixed-id',
      getD1Database: async () => null,
    })

    const approvedItems = await storeWithoutD1.listApprovedSubmissions()

    expect(approvedItems).toHaveLength(1)
    expect(approvedItems[0]?.slugCandidate).toBe('fallback-path')
  })
})
