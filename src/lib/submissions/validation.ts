import { isSignTemplateId, type SignTemplateId } from '@/src/lib/signs/templates'

export type SubmissionValidationInput = {
  slogan?: string
  selectedTemplate?: string
  submitterName?: string
  submitterEmail?: string
  acceptedPolicy?: boolean
  confirmedOwnership?: boolean
}

export type ValidatedSubmissionInput = {
  slogan: string
  slugCandidate: string
  selectedTemplate: SignTemplateId
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

function normalizeText(value: string | undefined) {
  return value?.replace(/\s+/g, ' ').trim() ?? ''
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
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

  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      errors,
    }
  }

  const validatedTemplate = selectedTemplate as SignTemplateId

  return {
    success: true,
    errors,
    value: {
      slogan,
      slugCandidate,
      selectedTemplate: validatedTemplate,
      submitterName: submitterName || undefined,
      submitterEmail: submitterEmail || undefined,
    },
  }
}
