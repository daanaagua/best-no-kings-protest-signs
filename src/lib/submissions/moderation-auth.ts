import { createHmac, timingSafeEqual } from 'node:crypto'

export const MODERATION_SESSION_COOKIE_NAME = 'internal-moderation-session'

const MODERATION_SESSION_VERSION = 'v1'
const MODERATION_SESSION_TTL_MS = 1000 * 60 * 60 * 12

type ModerationAuthConfig = {
  token: string
  secret: string
}

function normalizeSecret(value: string | undefined) {
  const normalized = value?.trim()

  return normalized || undefined
}

function readModerationAuthConfig(): ModerationAuthConfig | undefined {
  const token = process.env.INTERNAL_MODERATION_TOKEN
  const secret = normalizeSecret(process.env.INTERNAL_MODERATION_SESSION_SECRET)

  if (!token || !secret) {
    return undefined
  }

  return {
    token,
    secret,
  }
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left)
  const rightBuffer = Buffer.from(right)

  if (leftBuffer.length !== rightBuffer.length) {
    return false
  }

  return timingSafeEqual(leftBuffer, rightBuffer)
}

function buildSessionSignature(config: ModerationAuthConfig, expiresAt: number) {
  return createHmac('sha256', config.secret)
    .update(`${MODERATION_SESSION_VERSION}.${expiresAt}.${config.token}`)
    .digest('hex')
}

export function isModerationAuthConfigured() {
  return Boolean(readModerationAuthConfig())
}

export function isValidModerationToken(candidate: string | undefined) {
  const config = readModerationAuthConfig()
  const normalizedCandidate = candidate?.trim()

  if (!config || !normalizedCandidate) {
    return false
  }

  return safeEqual(normalizedCandidate, config.token)
}

export function createModerationSessionValue(now = Date.now()) {
  const config = readModerationAuthConfig()

  if (!config) {
    throw new Error('Moderation auth is not configured.')
  }

  const expiresAt = now + MODERATION_SESSION_TTL_MS
  const signature = buildSessionSignature(config, expiresAt)

  return `${MODERATION_SESSION_VERSION}.${expiresAt}.${signature}`
}

export function isValidModerationSessionValue(value: string | undefined, now = Date.now()) {
  const config = readModerationAuthConfig()

  if (!config || !value) {
    return false
  }

  const [version, expiresAtValue, signature] = value.split('.')

  if (!version || !expiresAtValue || !signature || version !== MODERATION_SESSION_VERSION) {
    return false
  }

  const expiresAt = Number.parseInt(expiresAtValue, 10)

  if (!Number.isFinite(expiresAt) || expiresAt <= now) {
    return false
  }

  const expectedSignature = buildSessionSignature(config, expiresAt)

  return safeEqual(signature, expectedSignature)
}

export function createModerationSessionCookie(now = Date.now()) {
  const value = createModerationSessionValue(now)
  const [, expiresAtValue] = value.split('.')
  const expiresAt = Number.parseInt(expiresAtValue ?? '0', 10)

  return {
    name: MODERATION_SESSION_COOKIE_NAME,
    value,
    options: {
      httpOnly: true,
      sameSite: 'lax' as const,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      expires: new Date(expiresAt),
    },
  }
}
