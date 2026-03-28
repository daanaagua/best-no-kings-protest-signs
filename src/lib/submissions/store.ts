import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { randomUUID } from 'node:crypto'

import { buildTemplatePreviewDataUrl, getSignTemplateDefinition, type SignTemplateId } from '@/src/lib/signs/templates'
import { officialLaunchSigns } from '@/src/data/signs'
import type { SignRecord } from '@/src/lib/signs/types'

export const SUBMISSION_STATUSES = ['pending', 'approved', 'rejected'] as const

export type SubmissionStatus = (typeof SUBMISSION_STATUSES)[number]

export type SubmissionRecord = {
  id: string
  slogan: string
  slugCandidate: string
  selectedTemplate: SignTemplateId
  submitterName?: string
  submitterEmail?: string
  status: SubmissionStatus
  createdAt: string
  moderatorNote?: string
}

export type SubmissionDraft = Omit<
  SubmissionRecord,
  'id' | 'status' | 'createdAt' | 'moderatorNote'
>

type SubmissionFile = {
  submissions: SubmissionRecord[]
}

type VotesFile = {
  votes: Record<string, number>
}

type SubmissionStoreOptions = {
  dataDir?: string
  now?: () => string
  generateId?: () => string
}

const DEFAULT_SUBMISSIONS_FILE: SubmissionFile = {
  submissions: [],
}

const DEFAULT_VOTES_FILE: VotesFile = {
  votes: {},
}

function cloneSubmission(record: SubmissionRecord): SubmissionRecord {
  return {
    ...record,
  }
}

function normalizeModeratorNote(note?: string) {
  const normalized = note?.replace(/\s+/g, ' ').trim()

  return normalized || undefined
}

function parseJsonFile<T>(content: string, fallback: T): T {
  try {
    return JSON.parse(content) as T
  } catch {
    return fallback
  }
}

async function writeJsonAtomic(filePath: string, payload: unknown) {
  const directory = path.dirname(filePath)
  const tempPath = path.join(
    directory,
    `${path.basename(filePath)}.${process.pid}.${Date.now()}.${randomUUID()}.tmp`,
  )

  await mkdir(directory, { recursive: true })
  await writeFile(tempPath, JSON.stringify(payload, null, 2))
  await rename(tempPath, filePath)
}

function createSerializedRunner() {
  let queue = Promise.resolve()

  return async function runSerialized<T>(operation: () => Promise<T>) {
    const result = queue.then(operation, operation)
    queue = result.then(
      () => undefined,
      () => undefined,
    )

    return result
  }
}

function buildUniqueSlugCandidate(baseSlug: string, usedSlugs: Set<string>) {
  if (!usedSlugs.has(baseSlug)) {
    return baseSlug
  }

  let suffix = 2

  while (usedSlugs.has(`${baseSlug}-${suffix}`)) {
    suffix += 1
  }

  return `${baseSlug}-${suffix}`
}

export function buildApprovedSubmissionSign(
  submission: SubmissionRecord,
  storedVoteCount = 0,
): SignRecord {
  const template = getSignTemplateDefinition(submission.selectedTemplate)
  const title = submission.slogan

  return {
    topic: 'no-kings',
    slug: submission.slugCandidate,
    title,
    slogan: submission.slogan,
    primaryCategory: template.primaryCategory,
    categories: [...template.categories],
    image: buildTemplatePreviewDataUrl(submission.slogan, submission.selectedTemplate),
    description: `${title} is an approved community No Kings sign submitted in the ${template.label.toLowerCase()} template for the public gallery.`,
    createdAt: submission.createdAt,
    voteCount: storedVoteCount,
    sourceType: 'community',
  }
}

export function createSubmissionStore(options: SubmissionStoreOptions = {}) {
  const dataDir = options.dataDir ?? path.join(process.cwd(), 'data')
  const submissionsPath = path.join(dataDir, 'submissions.json')
  const votesPath = path.join(dataDir, 'votes.json')
  const now = options.now ?? (() => new Date().toISOString())
  const generateId = options.generateId ?? (() => `submission-${randomUUID()}`)
  const runSerialized = createSerializedRunner()

  function ensureSyncFiles() {
    mkdirSync(dataDir, { recursive: true })

    try {
      readFileSync(submissionsPath, 'utf8')
    } catch {
      writeFileSync(submissionsPath, JSON.stringify(DEFAULT_SUBMISSIONS_FILE, null, 2))
    }

    try {
      readFileSync(votesPath, 'utf8')
    } catch {
      writeFileSync(votesPath, JSON.stringify(DEFAULT_VOTES_FILE, null, 2))
    }
  }

  async function ensureFiles() {
    await mkdir(dataDir, { recursive: true })

    try {
      await readFile(submissionsPath, 'utf8')
    } catch {
      await writeFile(submissionsPath, JSON.stringify(DEFAULT_SUBMISSIONS_FILE, null, 2))
    }

    try {
      await readFile(votesPath, 'utf8')
    } catch {
      await writeFile(votesPath, JSON.stringify(DEFAULT_VOTES_FILE, null, 2))
    }
  }

  function readSubmissionsFileSync() {
    ensureSyncFiles()

    return parseJsonFile(readFileSync(submissionsPath, 'utf8'), DEFAULT_SUBMISSIONS_FILE)
  }

  function readVotesFileSync() {
    ensureSyncFiles()

    return parseJsonFile(readFileSync(votesPath, 'utf8'), DEFAULT_VOTES_FILE)
  }

  async function readSubmissionsFile() {
    await ensureFiles()

    return parseJsonFile(await readFile(submissionsPath, 'utf8'), DEFAULT_SUBMISSIONS_FILE)
  }

  async function readVotesFile() {
    await ensureFiles()

    return parseJsonFile(await readFile(votesPath, 'utf8'), DEFAULT_VOTES_FILE)
  }

  async function writeSubmissionsFile(file: SubmissionFile) {
    await ensureFiles()
    await writeJsonAtomic(submissionsPath, file)
  }

  async function writeVotesFile(file: VotesFile) {
    await ensureFiles()
    await writeJsonAtomic(votesPath, file)
  }

  async function listSubmissions() {
    const file = await readSubmissionsFile()

    return file.submissions.map(cloneSubmission)
  }

  function listApprovedSubmissionsSync() {
    return readSubmissionsFileSync().submissions
      .filter((submission) => submission.status === 'approved')
      .map(cloneSubmission)
  }

  function getVotesSnapshotSync() {
    return {
      ...readVotesFileSync().votes,
    }
  }

  async function listApprovedSubmissions() {
    return (await listSubmissions()).filter((submission) => submission.status === 'approved')
  }

  async function listPendingSubmissions() {
    return (await listSubmissions()).filter((submission) => submission.status === 'pending')
  }

  async function createPendingSubmission(draft: SubmissionDraft) {
    return runSerialized(async () => {
      const file = await readSubmissionsFile()
      const record: SubmissionRecord = {
        id: generateId(),
        slogan: draft.slogan,
        slugCandidate: draft.slugCandidate,
        selectedTemplate: draft.selectedTemplate,
        submitterName: draft.submitterName,
        submitterEmail: draft.submitterEmail,
        status: 'pending',
        createdAt: now(),
      }

      file.submissions.unshift(record)
      await writeSubmissionsFile(file)

      return cloneSubmission(record)
    })
  }

  async function updateSubmissionStatus(
    id: string,
    status: SubmissionStatus,
    moderatorNote?: string,
  ) {
    return runSerialized(async () => {
      const file = await readSubmissionsFile()
      const index = file.submissions.findIndex((submission) => submission.id === id)

      if (index === -1) {
        throw new Error(`Submission not found: ${id}`)
      }

      if (file.submissions[index]?.status !== 'pending') {
        throw new Error('Only pending submissions can move through moderation.')
      }

      const currentSubmission = file.submissions[index]
      const publicSlugs = new Set(officialLaunchSigns.map((sign) => sign.slug))

      for (const submission of file.submissions) {
        if (submission.id !== id && submission.status === 'approved') {
          publicSlugs.add(submission.slugCandidate)
        }
      }

      const updated: SubmissionRecord = {
        ...currentSubmission,
        slugCandidate:
          status === 'approved'
            ? buildUniqueSlugCandidate(currentSubmission.slugCandidate, publicSlugs)
            : currentSubmission.slugCandidate,
        status,
        moderatorNote: normalizeModeratorNote(moderatorNote),
      }

      file.submissions[index] = updated
      await writeSubmissionsFile(file)

      return cloneSubmission(updated)
    })
  }

  async function approveSubmission(id: string, moderatorNote?: string) {
    return updateSubmissionStatus(id, 'approved', moderatorNote)
  }

  async function rejectSubmission(id: string, moderatorNote?: string) {
    return updateSubmissionStatus(id, 'rejected', moderatorNote)
  }

  async function getVoteCount(slug: string) {
    const file = await readVotesFile()

    return file.votes[slug] ?? 0
  }

  async function incrementVoteCount(slug: string, baseCount = 0) {
    return runSerialized(async () => {
      const file = await readVotesFile()
      const currentCount = file.votes[slug] ?? baseCount
      const nextCount = currentCount + 1

      file.votes[slug] = nextCount
      await writeVotesFile(file)

      return nextCount
    })
  }

  return {
    dataDir,
    createPendingSubmission,
    approveSubmission,
    rejectSubmission,
    listSubmissions,
    listPendingSubmissions,
    listApprovedSubmissions,
    listApprovedSubmissionsSync,
    getVotesSnapshotSync,
    getVoteCount,
    incrementVoteCount,
  }
}

const defaultStore = createSubmissionStore()

export function listApprovedSubmissionSignsSync() {
  const votes = defaultStore.getVotesSnapshotSync()

  return defaultStore
    .listApprovedSubmissionsSync()
    .map((submission) => buildApprovedSubmissionSign(submission, votes[submission.slugCandidate] ?? 0))
}

export function getStoredVotesSnapshotSync() {
  return defaultStore.getVotesSnapshotSync()
}

export function listApprovedSubmissionsSync() {
  return defaultStore.listApprovedSubmissionsSync()
}

export async function listSubmissions() {
  return defaultStore.listSubmissions()
}

export async function listPendingSubmissions() {
  return defaultStore.listPendingSubmissions()
}

export async function listApprovedSubmissions() {
  return defaultStore.listApprovedSubmissions()
}

export async function createPendingSubmission(draft: SubmissionDraft) {
  return defaultStore.createPendingSubmission(draft)
}

export async function approveSubmission(id: string, moderatorNote?: string) {
  return defaultStore.approveSubmission(id, moderatorNote)
}

export async function rejectSubmission(id: string, moderatorNote?: string) {
  return defaultStore.rejectSubmission(id, moderatorNote)
}

export async function getVoteCount(slug: string) {
  return defaultStore.getVoteCount(slug)
}

export async function incrementVoteCount(slug: string, baseCount = 0) {
  return defaultStore.incrementVoteCount(slug, baseCount)
}
