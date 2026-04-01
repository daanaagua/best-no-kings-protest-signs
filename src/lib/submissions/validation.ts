import type { SignBoardDocument, SubmissionAssetRecord } from '@/src/lib/signs/board-document'
import { getSignTemplateDefinition, isSignTemplateId } from '@/src/lib/signs/templates'
import type { SignCategory } from '@/src/lib/signs/types'

export type SubmissionValidationInput = {
  boardDocument?: unknown
  submissionAssets?: unknown
  submitterName?: string
  submitterEmail?: string
  acceptedPolicy?: boolean
  confirmedOwnership?: boolean
}

export type ValidatedSubmissionInput = {
  slogan: string
  slugCandidate: string
  selectedTemplate: SignBoardDocument['templateId']
  primaryCategory: SignCategory
  categories: SignCategory[]
  boardDocument: SignBoardDocument
  submissionAssets: SubmissionAssetRecord[]
  submitterName?: string
  submitterEmail?: string
}

export type SubmissionValidationErrors = Partial<Record<keyof SubmissionValidationInput | 'form', string>>

type SubmissionValidationFailure = {
  success: false
  errors: SubmissionValidationErrors
}

type SubmissionValidationSuccess = {
  success: true
  errors: SubmissionValidationErrors
  value: ValidatedSubmissionInput
}

export type SubmissionValidationResult = SubmissionValidationFailure | SubmissionValidationSuccess

const SUPPORTED_IMAGE_TYPES = new Set(['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'])
const MAX_FILE_SIZE_BYTES = 5_000_000
const MAX_IMAGE_DIMENSION = 4000
const MIN_LAYER_WIDTH = 40
const MIN_LAYER_HEIGHT = 40

function normalizeText(value: string | undefined) {
  return value?.replace(/\s+/g, ' ').trim() ?? ''
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function isSubmissionAssetRecord(value: unknown): value is SubmissionAssetRecord {
  return typeof value === 'object' && value !== null && typeof (value as SubmissionAssetRecord).id === 'string'
}

function isBoardDocument(value: unknown): value is SignBoardDocument {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as SignBoardDocument).templateId === 'string' &&
    Array.isArray((value as SignBoardDocument).layers)
  )
}

function validateBoardGeometry(boardDocument: SignBoardDocument) {
  for (const layer of boardDocument.layers) {
    if (layer.width < MIN_LAYER_WIDTH || layer.height < MIN_LAYER_HEIGHT) {
      return 'Keep every layer within the supported size bounds before submitting.'
    }

    if (
      layer.x < -boardDocument.canvasWidth ||
      layer.x > boardDocument.canvasWidth * 2 ||
      layer.y < -boardDocument.canvasHeight ||
      layer.y > boardDocument.canvasHeight * 2
    ) {
      return 'Keep layers within the editable board envelope before submitting.'
    }

    if (layer.type === 'text' && !normalizeText(layer.text)) {
      return 'Every visible text layer needs text before submitting.'
    }
  }

  return undefined
}

function validateAssets(assets: SubmissionAssetRecord[]) {
  for (const asset of assets) {
    if (!SUPPORTED_IMAGE_TYPES.has(asset.mimeType)) {
      return 'Use a supported image format before submitting.'
    }

    if (asset.fileSizeBytes > MAX_FILE_SIZE_BYTES) {
      return 'Keep uploaded image file size under the supported limit before submitting.'
    }

    if (asset.naturalWidth > MAX_IMAGE_DIMENSION || asset.naturalHeight > MAX_IMAGE_DIMENSION) {
      return 'Keep uploaded image dimensions within the supported limit before submitting.'
    }
  }

  return undefined
}

function derivePrimaryText(boardDocument: SignBoardDocument) {
  const textLayer = boardDocument.layers.find(
    (layer): layer is Extract<SignBoardDocument['layers'][number], { type: 'text' }> =>
      layer.type === 'text' && layer.visible && Boolean(normalizeText(layer.text)),
  )

  return textLayer ? normalizeText(textLayer.text) : undefined
}

function ensureImageAssetsResolve(boardDocument: SignBoardDocument, submissionAssets: SubmissionAssetRecord[]) {
  const assetIds = new Set(submissionAssets.map((asset) => asset.id))

  return boardDocument.layers.every(
    (layer) => layer.type !== 'image' || !layer.visible || assetIds.has(layer.imageAssetId),
  )
}

export function createSlugCandidate(slogan: string) {
  return slogan
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'community-sign'
}

export function validateSubmission(input: SubmissionValidationInput): SubmissionValidationResult {
  const submitterName = normalizeText(input.submitterName)
  const submitterEmail = normalizeText(input.submitterEmail).toLowerCase()
  const errors: SubmissionValidationErrors = {}

  if (!isBoardDocument(input.boardDocument) || !isSignTemplateId(input.boardDocument.templateId)) {
    errors.boardDocument = 'Build a valid board before submitting.'
  }

  const submissionAssets = Array.isArray(input.submissionAssets)
    ? input.submissionAssets.filter(isSubmissionAssetRecord)
    : []

  if (!input.acceptedPolicy) {
    errors.acceptedPolicy = 'You need to accept the content policy before submitting.'
  }

  if (!input.confirmedOwnership) {
    errors.confirmedOwnership = 'Confirm ownership so moderators know the design is safe to share.'
  }

  if (submitterEmail && !isValidEmail(submitterEmail)) {
    errors.submitterEmail = 'Enter a valid email address or leave the field blank.'
  }

  if (errors.boardDocument || !isBoardDocument(input.boardDocument) || !isSignTemplateId(input.boardDocument.templateId)) {
    return { success: false, errors }
  }

  const boardDocument = input.boardDocument
  const visibleLayers = boardDocument.layers.filter((layer) => layer.visible)

  if (visibleLayers.length === 0) {
    errors.boardDocument = 'Add at least one visible layer before submitting.'
  }

  const geometryError = validateBoardGeometry(boardDocument)
  if (geometryError) {
    errors.boardDocument = geometryError
  }

  const assetsError = validateAssets(submissionAssets)
  if (assetsError) {
    errors.submissionAssets = assetsError
  }

  if (!ensureImageAssetsResolve(boardDocument, submissionAssets)) {
    errors.boardDocument = 'Every visible image layer needs a matching image asset before submitting.'
  }

  const slogan = derivePrimaryText(boardDocument)
  if (!errors.boardDocument && !slogan) {
    errors.boardDocument = 'Add at least one visible text layer so we can create a public slogan and slug.'
  }

  if (Object.keys(errors).length > 0 || !slogan) {
    return {
      success: false,
      errors,
    }
  }

  const slugCandidate = createSlugCandidate(slogan)
  const templateDefinition = getSignTemplateDefinition(boardDocument.templateId)

  return {
    success: true,
    errors,
    value: {
      slogan,
      slugCandidate,
      selectedTemplate: boardDocument.templateId,
      primaryCategory: templateDefinition.primaryCategory,
      categories: [...templateDefinition.categories],
      boardDocument,
      submissionAssets,
      submitterName: submitterName || undefined,
      submitterEmail: submitterEmail || undefined,
    },
  }
}
