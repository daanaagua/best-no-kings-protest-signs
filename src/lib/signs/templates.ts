import type { SignCategory } from '@/src/lib/signs/types'

export const SIGN_TEMPLATE_IDS = ['classic', 'tilted', 'bold-marker', 'printable'] as const

export type SignTemplateId = (typeof SIGN_TEMPLATE_IDS)[number]

export type SignTemplateDefinition = {
  id: SignTemplateId
  label: string
  description: string
  primaryCategory: SignCategory
  categories: SignCategory[]
  accentColor: string
  boardColor: string
  textColor: string
  rotation: number
}

export const SIGN_TEMPLATE_DEFINITIONS: Record<SignTemplateId, SignTemplateDefinition> = {
  classic: {
    id: 'classic',
    label: 'Classic chant board',
    description: 'Centered rally copy with a steady, all-purpose poster layout.',
    primaryCategory: 'best',
    categories: ['best', 'printable'],
    accentColor: '#d45736',
    boardColor: '#fff9ef',
    textColor: '#162635',
    rotation: -1.5,
  },
  tilted: {
    id: 'tilted',
    label: 'Tilted curbside sign',
    description: 'A slightly skewed board with playful, punchy march energy.',
    primaryCategory: 'funny',
    categories: ['funny', 'best'],
    accentColor: '#31516b',
    boardColor: '#fff4df',
    textColor: '#162635',
    rotation: -4,
  },
  'bold-marker': {
    id: 'bold-marker',
    label: 'Bold marker block',
    description: 'Heavy marker lettering for short slogans and fast reads.',
    primaryCategory: 'funny',
    categories: ['funny', 'printable'],
    accentColor: '#162635',
    boardColor: '#f4e6ca',
    textColor: '#0d2235',
    rotation: 1.25,
  },
  printable: {
    id: 'printable',
    label: 'Printable flyer layout',
    description: 'High-contrast stacked lines designed for quick home printing.',
    primaryCategory: 'printable',
    categories: ['printable', 'best'],
    accentColor: '#0d2235',
    boardColor: '#ffffff',
    textColor: '#111111',
    rotation: 0,
  },
}

function escapeSvgText(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function isSignTemplateId(value: string): value is SignTemplateId {
  return SIGN_TEMPLATE_IDS.includes(value as SignTemplateId)
}

export function getSignTemplateDefinition(template: SignTemplateId) {
  return SIGN_TEMPLATE_DEFINITIONS[template]
}

export function normalizePreviewSlogan(slogan: string) {
  const normalized = slogan.replace(/\s+/g, ' ').trim()

  return normalized || 'Your slogan preview'
}

export function getPreviewLines(slogan: string) {
  const normalized = normalizePreviewSlogan(slogan)
  const words = normalized.split(' ')
  const lines: string[] = []

  if (words.length <= 3) {
    return [normalized]
  }

  const wordsPerLine = words.length <= 6 ? 2 : 3

  for (let index = 0; index < words.length; index += wordsPerLine) {
    lines.push(words.slice(index, index + wordsPerLine).join(' '))
  }

  return lines
}

export function buildTemplatePreviewDataUrl(slogan: string, template: SignTemplateId) {
  const definition = getSignTemplateDefinition(template)
  const lines = getPreviewLines(slogan)
  const lineMarkup = lines
    .map((line, index) => {
      const y = 118 + index * 92

      return `<text x="400" y="${y}" text-anchor="middle" font-family="Arial Black, Impact, sans-serif" font-size="54" letter-spacing="2" fill="${definition.textColor}">${escapeSvgText(line.toUpperCase())}</text>`
    })
    .join('')

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="800" height="1000" viewBox="0 0 800 1000" role="img" aria-label="${escapeSvgText(normalizePreviewSlogan(slogan))}">
      <rect width="800" height="1000" fill="#ead8b8" />
      <rect x="112" y="48" width="576" height="904" rx="30" fill="${definition.boardColor}" stroke="#162635" stroke-width="16" transform="rotate(${definition.rotation} 400 500)" />
      <rect x="162" y="106" width="476" height="72" rx="18" fill="${definition.accentColor}" transform="rotate(${definition.rotation} 400 500)" />
      <text x="400" y="154" text-anchor="middle" font-family="Arial Narrow, Arial, sans-serif" font-size="28" letter-spacing="5" fill="#fffaf0">${escapeSvgText(definition.label.toUpperCase())}</text>
      <g transform="rotate(${definition.rotation} 400 500)">${lineMarkup}</g>
      <rect x="372" y="930" width="56" height="180" rx="16" fill="#bd7a31" />
    </svg>
  `

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg.replace(/\s+/g, ' ').trim())}`
}
