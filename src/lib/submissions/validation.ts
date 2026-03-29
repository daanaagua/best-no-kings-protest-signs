import {
  MAX_TEXT_OFFSET_Y,
  MAX_TEXT_ROTATION,
  MAX_TEXT_SCALE,
  MIN_TEXT_OFFSET_Y,
  MIN_TEXT_ROTATION,
  MIN_TEXT_SCALE,
  getSignTemplateDefinition,
  isTextColorOptionId,
  isSignTemplateId,
  normalizeTemplatePreviewStyleOptions,
  type SignTemplateId,
  type TextColorOptionId,
} from '@/src/lib/signs/templates'
import type { SignCategory } from '@/src/lib/signs/types'

export type SubmissionValidationInput = {
  slogan?: string
  selectedTemplate?: string
  submitterName?: string
  submitterEmail?: string
  selectedTextColor?: string
  textRotation?: number
  textOffsetY?: number
  textScale?: number
  acceptedPolicy?: boolean
  confirmedOwnership?: boolean
}

export type ValidatedSubmissionInput = {
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

function normalizeText(value: string | undefined) {
  return value?.replace(/\s+/g, ' ').trim() ?? ''
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function isWithinRange(value: number, min: number, max: number) {
  return Number.isFinite(value) && value >= min && value <= max
}

export function createSlugCandidate(slogan: string) {
  const normalized = slogan
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return normalized || 'community-sign'
}

export function validateSubmission(input: SubmissionValidationInput): SubmissionValidationResult {
  const slogan = normalizeText(input.slogan)
  const slugCandidate = createSlugCandidate(slogan)
  const submitterName = normalizeText(input.submitterName)
  const submitterEmail = normalizeText(input.submitterEmail).toLowerCase()
  const selectedTemplate = input.selectedTemplate
  const previewStyleOptions = normalizeTemplatePreviewStyleOptions({
    selectedTextColor: input.selectedTextColor as TextColorOptionId | undefined,
    textRotation: input.textRotation,
    textOffsetY: input.textOffsetY,
    textScale: input.textScale,
  })
  const errors: SubmissionValidationErrors = {}

  if (!slogan) {
    errors.slogan = 'Enter a slogan before sending your sign for review.'
  } else if (slogan.length < 4) {
    errors.slogan = 'Use at least 4 characters so moderators can review it.'
  } else if (slogan.length > 120) {
    errors.slogan = 'Keep slogans under 120 characters for the MVP sign layouts.'
  } else if (!/[a-z0-9]/i.test(slogan) || slugCandidate === 'community-sign') {
    errors.slogan = 'Use at least one letter or number so we can create a usable slug candidate.'
  }

  if (!selectedTemplate || !isSignTemplateId(selectedTemplate)) {
    errors.selectedTemplate = 'Choose one of the four supported sign templates.'
  }

  if (!input.acceptedPolicy) {
    errors.acceptedPolicy = 'You need to accept the content policy before submitting.'
  }

  if (!input.confirmedOwnership) {
    errors.confirmedOwnership = 'Confirm ownership so moderators know the slogan is yours or safe to share.'
  }

  if (submitterEmail && !isValidEmail(submitterEmail)) {
    errors.submitterEmail = 'Enter a valid email address or leave the field blank.'
  }

  if (input.selectedTextColor !== undefined && !isTextColorOptionId(input.selectedTextColor)) {
    errors.selectedTextColor = 'Choose a supported text color before submitting.'
  }

  if (
    input.textRotation !== undefined &&
    !isWithinRange(input.textRotation, MIN_TEXT_ROTATION, MAX_TEXT_ROTATION)
  ) {
    errors.textRotation = `Keep text angle between ${MIN_TEXT_ROTATION} and ${MAX_TEXT_ROTATION} degrees.`
  }

  if (
    input.textOffsetY !== undefined &&
    !isWithinRange(input.textOffsetY, MIN_TEXT_OFFSET_Y, MAX_TEXT_OFFSET_Y)
  ) {
    errors.textOffsetY = `Keep text position between ${MIN_TEXT_OFFSET_Y} and ${MAX_TEXT_OFFSET_Y} pixels.`
  }

  if (input.textScale !== undefined && !isWithinRange(input.textScale, MIN_TEXT_SCALE, MAX_TEXT_SCALE)) {
    errors.textScale = `Keep text size between ${MIN_TEXT_SCALE} and ${MAX_TEXT_SCALE}.`
  }

  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      errors,
    }
  }

  const validatedTemplate = selectedTemplate as SignTemplateId
  const templateDefinition = getSignTemplateDefinition(validatedTemplate)

  return {
    success: true,
    errors,
    value: {
      slogan,
      slugCandidate,
      selectedTemplate: validatedTemplate,
      primaryCategory: templateDefinition.primaryCategory,
      categories: [...templateDefinition.categories],
      submitterName: submitterName || undefined,
      submitterEmail: submitterEmail || undefined,
      selectedTextColor: previewStyleOptions.selectedTextColor,
      textRotation: previewStyleOptions.textRotation,
      textOffsetY: previewStyleOptions.textOffsetY,
      textScale: previewStyleOptions.textScale,
    },
  }
}
