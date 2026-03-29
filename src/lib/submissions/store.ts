import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { randomUUID } from 'node:crypto'
import { getCloudflareContext } from '@opennextjs/cloudflare'

import {
  buildTemplatePreviewDataUrl,
  getSignTemplateDefinition,
  normalizeTemplatePreviewStyleOptions,
  type SignTemplateId,
  type TextColorOptionId,
} from '@/src/lib/signs/templates'
import { getOfficialSigns } from '@/src/data/signs'
import type { SignCategory, SignRecord } from '@/src/lib/signs/types'

export const SUBMISSION_STATUSES = ['pending', 'approved', 'rejected'] as const

export type SubmissionStatus = (typeof SUBMISSION_STATUSES)[number]

export type SubmissionRecord = {
  id: string
  slogan: string
  slugCandidate: string
  selectedTemplate: SignTemplateId
  primaryCategory: SignCategory
  categories: SignCategory[]
  submitterName?: string
  submitterEmail?: string
  selectedTextColor?: TextColorOptionId
  textRotation: number
  textOffsetY: number
  textScale: number
  status: SubmissionStatus
  createdAt: string
  approvedAt?: string
  moderatorNote?: string
}

export type SubmissionDraft = Omit<
  SubmissionRecord,
  'id' | 'status' | 'createdAt' | 'approvedAt' | 'moderatorNote'
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
  getD1Database?: () => Promise<SubmissionDatabase | null | undefined>
}

type SubmissionDatabaseValue = number | string | null

type SubmissionDatabaseStatement = {
  bind: (...values: SubmissionDatabaseValue[]) => SubmissionDatabaseStatement
  all: <T = Record<string, unknown>>() => Promise<{ results?: T[] }>
  first: <T = unknown>(columnName?: string) => Promise<T | null>
  run: () => Promise<unknown>
}

type SubmissionDatabase = {
  prepare: (query: string) => SubmissionDatabaseStatement
}

type SubmissionDatabaseRow = {
  id: string
  slogan: string
  slug_candidate: string
  selected_template: SignTemplateId
  primary_category: SignCategory | null
  categories_json: string | null
  submitter_name: string | null
  submitter_email: string | null
  selected_text_color: TextColorOptionId | null
  text_rotation: number | null
  text_offset_y: number | null
  text_scale: number | null
  status: SubmissionStatus
  created_at: string
  approved_at: string | null
  moderator_note: string | null
}

type VoteDatabaseRow = {
  slug: string
  vote_count: number
}

const DEFAULT_SUBMISSIONS_FILE: SubmissionFile = {
  submissions: [],
}

const DEFAULT_VOTES_FILE: VotesFile = {
  votes: {},
}

const SUBMISSION_SELECT_COLUMNS =
  'id, slogan, slug_candidate, selected_template, primary_category, categories_json, submitter_name, submitter_email, selected_text_color, text_rotation, text_offset_y, text_scale, status, created_at, approved_at, moderator_note'

const LIST_SUBMISSIONS_SQL = `SELECT ${SUBMISSION_SELECT_COLUMNS} FROM submissions ORDER BY datetime(created_at) DESC, id DESC`
const LIST_SUBMISSIONS_BY_STATUS_SQL = `SELECT ${SUBMISSION_SELECT_COLUMNS} FROM submissions WHERE status = ? ORDER BY datetime(created_at) DESC, id DESC`
const FIND_SUBMISSION_BY_ID_SQL = `SELECT ${SUBMISSION_SELECT_COLUMNS} FROM submissions WHERE id = ?`
const LIST_APPROVED_SLUGS_SQL =
  'SELECT slug_candidate FROM submissions WHERE status = ? AND id != ?'
const INSERT_SUBMISSION_SQL =
  'INSERT INTO submissions (id, slogan, slug_candidate, selected_template, primary_category, categories_json, submitter_name, submitter_email, selected_text_color, text_rotation, text_offset_y, text_scale, status, created_at, approved_at, moderator_note) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
const UPDATE_SUBMISSION_STATUS_SQL =
  'UPDATE submissions SET slug_candidate = ?, status = ?, approved_at = ?, moderator_note = ? WHERE id = ?'
const LIST_VOTES_SQL = 'SELECT slug, vote_count FROM votes'
const GET_VOTE_COUNT_SQL = 'SELECT vote_count FROM votes WHERE slug = ?'
const UPSERT_VOTE_SQL =
  'INSERT INTO votes (slug, vote_count) VALUES (?, ?) ON CONFLICT(slug) DO UPDATE SET vote_count = vote_count + 1'
const D1_APPROVAL_SLUG_RETRY_LIMIT = 3

function cloneSubmission(record: SubmissionRecord): SubmissionRecord {
  const normalized = normalizeSubmissionRecord(record)

  return {
    ...normalized,
    categories: [...normalized.categories],
  }
}

function parseSubmissionCategories(record: SubmissionDatabaseRow) {
  const parsed = record.categories_json ? parseJsonFile(record.categories_json, []) : []

  return Array.isArray(parsed) ? (parsed as SignCategory[]) : []
}

function mapSubmissionDatabaseRow(row: SubmissionDatabaseRow): SubmissionRecord {
  return normalizeSubmissionRecord({
    id: row.id,
    slogan: row.slogan,
    slugCandidate: row.slug_candidate,
    selectedTemplate: row.selected_template,
    primaryCategory: row.primary_category ?? getSignTemplateDefinition(row.selected_template).primaryCategory,
    categories: parseSubmissionCategories(row),
    submitterName: row.submitter_name ?? undefined,
    submitterEmail: row.submitter_email ?? undefined,
    selectedTextColor: row.selected_text_color ?? undefined,
    textRotation: row.text_rotation ?? 0,
    textOffsetY: row.text_offset_y ?? 0,
    textScale: row.text_scale ?? 1,
    status: row.status,
    createdAt: row.created_at,
    approvedAt: row.approved_at ?? undefined,
    moderatorNote: row.moderator_note ?? undefined,
  })
}

async function resolveDefaultD1Database() {
  try {
    const context = await getCloudflareContext({ async: true })

    return (context.env.SUBMISSIONS_DB as SubmissionDatabase | undefined) ?? null
  } catch {
    return null
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

function isApprovedSlugConflictError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error)

  return /unique constraint failed/i.test(message) && /slug_candidate/i.test(message)
}

function normalizeSubmissionRecord(record: SubmissionRecord): SubmissionRecord {
  const template = getSignTemplateDefinition(record.selectedTemplate)
  const previewStyleOptions = normalizeTemplatePreviewStyleOptions(record)

  return {
    ...record,
    primaryCategory: record.primaryCategory ?? template.primaryCategory,
    categories:
      Array.isArray(record.categories) && record.categories.length > 0
        ? [...record.categories]
        : [...template.categories],
    selectedTextColor: previewStyleOptions.selectedTextColor,
    textRotation: previewStyleOptions.textRotation,
    textOffsetY: previewStyleOptions.textOffsetY,
    textScale: previewStyleOptions.textScale,
    approvedAt: record.status === 'approved' ? record.approvedAt : undefined,
  }
}

function normalizeSubmissionFile(file: SubmissionFile): SubmissionFile {
  if (!Array.isArray(file.submissions)) {
    return DEFAULT_SUBMISSIONS_FILE
  }

  return {
    submissions: file.submissions.map((submission) =>
      normalizeSubmissionRecord(submission as SubmissionRecord),
    ),
  }
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
    primaryCategory: submission.primaryCategory,
    categories: [...submission.categories],
    image: buildTemplatePreviewDataUrl(submission.slogan, submission.selectedTemplate, submission),
    description: `${title} is an approved community No Kings sign submitted in the ${template.label.toLowerCase()} template for the public gallery.`,
    createdAt: submission.createdAt,
    voteCount: storedVoteCount,
    sourceType: 'community',
    submitterName: submission.submitterName,
    selectedTextColor: submission.selectedTextColor,
    textRotation: submission.textRotation,
    textOffsetY: submission.textOffsetY,
    textScale: submission.textScale,
    approvedAt: submission.approvedAt,
  }
}

export function createSubmissionStore(options: SubmissionStoreOptions = {}) {
  const dataDir = options.dataDir ?? path.join(process.cwd(), 'data')
  const submissionsPath = path.join(dataDir, 'submissions.json')
  const votesPath = path.join(dataDir, 'votes.json')
  const now = options.now ?? (() => new Date().toISOString())
  const generateId = options.generateId ?? (() => `submission-${randomUUID()}`)
  const resolveD1Database = options.getD1Database ?? resolveDefaultD1Database
  const runSerialized = createSerializedRunner()
  let d1DatabasePromise: Promise<SubmissionDatabase | null> | undefined

  async function getD1Database() {
    d1DatabasePromise ??= Promise.resolve(resolveD1Database()).then((database) => database ?? null)

    return d1DatabasePromise
  }

  async function withAsyncStore<T>(operations: {
    d1: (database: SubmissionDatabase) => Promise<T>
    file: () => Promise<T>
  }) {
    const database = await getD1Database()

    if (database) {
      return operations.d1(database)
    }

    return operations.file()
  }

  async function listSubmissionRowsFromD1(
    database: SubmissionDatabase,
    status?: SubmissionStatus,
  ) {
    const statement = status
      ? database.prepare(LIST_SUBMISSIONS_BY_STATUS_SQL).bind(status)
      : database.prepare(LIST_SUBMISSIONS_SQL)
    const result = await statement.all<SubmissionDatabaseRow>()

    return (result.results ?? []).map(mapSubmissionDatabaseRow)
  }

  async function findSubmissionByIdFromD1(database: SubmissionDatabase, id: string) {
    const row = await database.prepare(FIND_SUBMISSION_BY_ID_SQL).bind(id).first<SubmissionDatabaseRow>()

    return row ? mapSubmissionDatabaseRow(row) : null
  }

  async function listApprovedSlugsFromD1(database: SubmissionDatabase, excludedId: string) {
    const result = await database
      .prepare(LIST_APPROVED_SLUGS_SQL)
      .bind('approved', excludedId)
      .all<{ slug_candidate: string }>()

    return (result.results ?? []).map((row) => row.slug_candidate)
  }

  async function buildApprovedSlugCandidateFromD1(
    database: SubmissionDatabase,
    excludedId: string,
    baseSlug: string,
  ) {
    const publicSlugs = new Set(getOfficialSigns().map((sign) => sign.slug))

    for (const slug of await listApprovedSlugsFromD1(database, excludedId)) {
      publicSlugs.add(slug)
    }

    return buildUniqueSlugCandidate(baseSlug, publicSlugs)
  }

  async function getVotesSnapshotFromD1(database: SubmissionDatabase) {
    const result = await database.prepare(LIST_VOTES_SQL).all<VoteDatabaseRow>()

    return (result.results ?? []).reduce<Record<string, number>>((snapshot, row) => {
      snapshot[row.slug] = row.vote_count
      return snapshot
    }, {})
  }

  async function createPendingSubmissionInD1(database: SubmissionDatabase, draft: SubmissionDraft) {
    const record: SubmissionRecord = {
      id: generateId(),
      slogan: draft.slogan,
      slugCandidate: draft.slugCandidate,
      selectedTemplate: draft.selectedTemplate,
      primaryCategory: draft.primaryCategory,
      categories: [...draft.categories],
      submitterName: draft.submitterName,
      submitterEmail: draft.submitterEmail,
      selectedTextColor: draft.selectedTextColor,
      textRotation: draft.textRotation,
      textOffsetY: draft.textOffsetY,
      textScale: draft.textScale,
      status: 'pending',
      createdAt: now(),
    }

    await database
      .prepare(INSERT_SUBMISSION_SQL)
      .bind(
        record.id,
        record.slogan,
        record.slugCandidate,
        record.selectedTemplate,
        record.primaryCategory,
        JSON.stringify(record.categories),
        record.submitterName ?? null,
        record.submitterEmail ?? null,
        record.selectedTextColor ?? null,
        record.textRotation,
        record.textOffsetY,
        record.textScale,
        record.status,
        record.createdAt,
        null,
        null,
      )
      .run()

    return cloneSubmission(record)
  }

  async function updateSubmissionStatusInD1(
    database: SubmissionDatabase,
    id: string,
    status: SubmissionStatus,
    moderatorNote?: string,
  ) {
    const currentSubmission = await findSubmissionByIdFromD1(database, id)

    if (!currentSubmission) {
      throw new Error(`Submission not found: ${id}`)
    }

    if (currentSubmission.status !== 'pending') {
      throw new Error('Only pending submissions can move through moderation.')
    }

    const normalizedModeratorNote = normalizeModeratorNote(moderatorNote)
    const approvedAt = status === 'approved' ? now() : undefined

    for (let attempt = 0; attempt < D1_APPROVAL_SLUG_RETRY_LIMIT; attempt += 1) {
      const updated: SubmissionRecord = {
        ...currentSubmission,
        slugCandidate:
          status === 'approved'
            ? await buildApprovedSlugCandidateFromD1(database, id, currentSubmission.slugCandidate)
            : currentSubmission.slugCandidate,
        status,
        approvedAt,
        moderatorNote: normalizedModeratorNote,
      }

      try {
        await database
          .prepare(UPDATE_SUBMISSION_STATUS_SQL)
          .bind(
            updated.slugCandidate,
            updated.status,
            updated.approvedAt ?? null,
            updated.moderatorNote ?? null,
            id,
          )
          .run()

        return cloneSubmission(updated)
      } catch (error) {
        if (
          status !== 'approved' ||
          attempt === D1_APPROVAL_SLUG_RETRY_LIMIT - 1 ||
          !isApprovedSlugConflictError(error)
        ) {
          throw error
        }
      }
    }

    throw new Error(`Unable to update submission status for ${id}`)
  }

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

    return normalizeSubmissionFile(
      parseJsonFile(readFileSync(submissionsPath, 'utf8'), DEFAULT_SUBMISSIONS_FILE),
    )
  }

  function readVotesFileSync() {
    ensureSyncFiles()

    return parseJsonFile(readFileSync(votesPath, 'utf8'), DEFAULT_VOTES_FILE)
  }

  async function readSubmissionsFile() {
    await ensureFiles()

    return normalizeSubmissionFile(
      parseJsonFile(await readFile(submissionsPath, 'utf8'), DEFAULT_SUBMISSIONS_FILE),
    )
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
    return withAsyncStore({
      d1: async (database) => listSubmissionRowsFromD1(database),
      file: async () => {
        const file = await readSubmissionsFile()

        return file.submissions.map(cloneSubmission)
      },
    })
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
    return withAsyncStore({
      d1: async (database) => listSubmissionRowsFromD1(database, 'approved'),
      file: async () =>
        (await listSubmissions()).filter((submission) => submission.status === 'approved'),
    })
  }

  async function listPendingSubmissions() {
    return withAsyncStore({
      d1: async (database) => listSubmissionRowsFromD1(database, 'pending'),
      file: async () =>
        (await listSubmissions()).filter((submission) => submission.status === 'pending'),
    })
  }

  async function createPendingSubmission(draft: SubmissionDraft) {
    return runSerialized(async () => {
      return withAsyncStore({
        d1: async (database) => createPendingSubmissionInD1(database, draft),
        file: async () => {
          const file = await readSubmissionsFile()
          const record: SubmissionRecord = {
            id: generateId(),
            slogan: draft.slogan,
            slugCandidate: draft.slugCandidate,
            selectedTemplate: draft.selectedTemplate,
            primaryCategory: draft.primaryCategory,
            categories: [...draft.categories],
            submitterName: draft.submitterName,
            submitterEmail: draft.submitterEmail,
            selectedTextColor: draft.selectedTextColor,
            textRotation: draft.textRotation,
            textOffsetY: draft.textOffsetY,
            textScale: draft.textScale,
            status: 'pending',
            createdAt: now(),
          }

          file.submissions.unshift(record)
          await writeSubmissionsFile(file)

          return cloneSubmission(record)
        },
      })
    })
  }

  async function updateSubmissionStatus(
    id: string,
    status: SubmissionStatus,
    moderatorNote?: string,
  ) {
    return runSerialized(async () => {
      return withAsyncStore({
        d1: async (database) => updateSubmissionStatusInD1(database, id, status, moderatorNote),
        file: async () => {
          const file = await readSubmissionsFile()
          const index = file.submissions.findIndex((submission) => submission.id === id)

          if (index === -1) {
            throw new Error(`Submission not found: ${id}`)
          }

          if (file.submissions[index]?.status !== 'pending') {
            throw new Error('Only pending submissions can move through moderation.')
          }

          const currentSubmission = file.submissions[index]
          const publicSlugs = new Set(getOfficialSigns().map((sign) => sign.slug))

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
            approvedAt: status === 'approved' ? now() : undefined,
            moderatorNote: normalizeModeratorNote(moderatorNote),
          }

          file.submissions[index] = updated
          await writeSubmissionsFile(file)

          return cloneSubmission(updated)
        },
      })
    })
  }

  async function approveSubmission(id: string, moderatorNote?: string) {
    return updateSubmissionStatus(id, 'approved', moderatorNote)
  }

  async function rejectSubmission(id: string, moderatorNote?: string) {
    return updateSubmissionStatus(id, 'rejected', moderatorNote)
  }

  async function getVoteCount(slug: string) {
    return withAsyncStore({
      d1: async (database) =>
        (await database.prepare(GET_VOTE_COUNT_SQL).bind(slug).first<number>('vote_count')) ?? 0,
      file: async () => {
        const file = await readVotesFile()

        return file.votes[slug] ?? 0
      },
    })
  }

  async function getStoredVotesSnapshot() {
    return withAsyncStore({
      d1: async (database) => getVotesSnapshotFromD1(database),
      file: async () => {
        const file = await readVotesFile()

        return {
          ...file.votes,
        }
      },
    })
  }

  async function incrementVoteCount(slug: string, baseCount = 0) {
    return runSerialized(async () => {
      return withAsyncStore({
        d1: async (database) => {
          await database.prepare(UPSERT_VOTE_SQL).bind(slug, baseCount + 1).run()

          return (await database.prepare(GET_VOTE_COUNT_SQL).bind(slug).first<number>('vote_count')) ?? 0
        },
        file: async () => {
          const file = await readVotesFile()
          const currentCount = file.votes[slug] ?? baseCount
          const nextCount = currentCount + 1

          file.votes[slug] = nextCount
          await writeVotesFile(file)

          return nextCount
        },
      })
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
    getStoredVotesSnapshot,
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

export async function getStoredVotesSnapshot() {
  return defaultStore.getStoredVotesSnapshot()
}

export async function incrementVoteCount(slug: string, baseCount = 0) {
  return defaultStore.incrementVoteCount(slug, baseCount)
}
