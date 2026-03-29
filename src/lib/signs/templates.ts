import type { SignCategory } from '@/src/lib/signs/types'

export const SIGN_TEMPLATE_IDS = ['classic', 'tilted', 'bold-marker', 'printable'] as const

export type SignTemplateId = (typeof SIGN_TEMPLATE_IDS)[number]

export type SignTemplateDefinition = {
  id: SignTemplateId
  label: string
  description: string
  primaryCategory: SignCategory
  categories: SignCategory[]
  previewBackground: string
  accentColor: string
  boardColor: string
  textColor: string
  rotation: number
  textFrameTop: string
  textFrameWidth: string
}

export const TEXT_COLOR_OPTIONS = [
  { id: 'charcoal', label: 'Charcoal black', value: '#171717' },
  { id: 'signal-red', label: 'Signal red', value: '#b42318' },
  { id: 'civic-navy', label: 'Civic navy', value: '#1f3d63' },
  { id: 'muted-gold', label: 'Muted gold', value: '#8a5a2b' },
] as const

export type TextColorOptionId = (typeof TEXT_COLOR_OPTIONS)[number]['id']

export const SIGN_TEMPLATE_DEFINITIONS: Record<SignTemplateId, SignTemplateDefinition> = {
  classic: {
    id: 'classic',
    label: 'Centered crowd board',
    description: 'A straight-on rally board with balanced margins and room for long lines.',
    primaryCategory: 'best',
    categories: ['best', 'printable'],
    previewBackground: '/submit-templates/classic-board.png',
    accentColor: '#d45736',
    boardColor: '#fff9ef',
    textColor: '#162635',
    rotation: 0,
    textFrameTop: '49%',
    textFrameWidth: '78%',
  },
  tilted: {
    id: 'tilted',
    label: 'Street rally board',
    description: 'A slightly weathered white board with a tighter text box for shorter chants.',
    primaryCategory: 'best',
    categories: ['best'],
    previewBackground: '/submit-templates/street-board.png',
    accentColor: '#31516b',
    boardColor: '#fff4df',
    textColor: '#162635',
    rotation: 0,
    textFrameTop: '50%',
    textFrameWidth: '74%',
  },
  'bold-marker': {
    id: 'bold-marker',
    label: 'Bold march board',
    description: 'A closer white board layout meant for punchier marker-heavy slogans.',
    primaryCategory: 'printable',
    categories: ['printable'],
    previewBackground: '/submit-templates/bold-board.png',
    accentColor: '#162635',
    boardColor: '#f4e6ca',
    textColor: '#0d2235',
    rotation: 0,
    textFrameTop: '50%',
    textFrameWidth: '72%',
  },
  printable: {
    id: 'printable',
    label: 'Poster wall board',
    description: 'A cleaner board with more vertical room for longer protest copy.',
    primaryCategory: 'printable',
    categories: ['printable', 'best'],
    previewBackground: '/submit-templates/poster-board.png',
    accentColor: '#0d2235',
    boardColor: '#ffffff',
    textColor: '#111111',
    rotation: 0,
    textFrameTop: '50%',
    textFrameWidth: '80%',
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

function splitLongWord(word: string, chunkLength = 12) {
  if (word.length <= chunkLength) {
    return [word]
  }

  const chunks: string[] = []

  for (let index = 0; index < word.length; index += chunkLength) {
    chunks.push(word.slice(index, index + chunkLength))
  }

  return chunks
}

export function getPreviewLines(slogan: string) {
  const normalized = normalizePreviewSlogan(slogan)
  const words = normalized.split(' ').flatMap((word) => splitLongWord(word))
  const lines: string[] = []
  const maxLineLength = words.length <= 3 ? 14 : words.length <= 6 ? 16 : 18

  let currentLine = ''

  if (words.length === 1) {
    return [normalized]
  }

  for (const word of words) {
    const nextLine = currentLine ? `${currentLine} ${word}` : word

    if (nextLine.length <= maxLineLength || !currentLine) {
      currentLine = nextLine
      continue
    }

    lines.push(currentLine)
    currentLine = word
  }

  if (currentLine) {
    lines.push(currentLine)
  }

  return lines
}

export function buildTemplatePreviewDataUrl(slogan: string, template: SignTemplateId) {
  const definition = getSignTemplateDefinition(template)
  const lines = getPreviewLines(slogan)
  const fontSize = lines.length >= 6 ? 38 : lines.length === 5 ? 44 : 54
  const lineHeight = fontSize + 24
  const startY = 500 - ((lines.length - 1) * lineHeight) / 2
  const lineMarkup = lines
    .map((line, index) => {
      const y = startY + index * lineHeight

      return `<text x="400" y="${y}" text-anchor="middle" font-family="Arial Black, Impact, sans-serif" font-size="${fontSize}" letter-spacing="2" fill="${definition.textColor}">${escapeSvgText(line.toUpperCase())}</text>`
    })
    .join('')

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="800" height="1000" viewBox="0 0 800 1000" role="img" aria-label="${escapeSvgText(normalizePreviewSlogan(slogan))}">
      <rect width="800" height="1000" fill="#d7d3cd" />
      <rect x="112" y="48" width="576" height="904" rx="30" fill="${definition.boardColor}" stroke="#162635" stroke-width="16" transform="rotate(${definition.rotation} 400 500)" />
      <rect x="128" y="64" width="544" height="872" rx="22" fill="none" stroke="rgba(22, 38, 53, 0.08)" stroke-width="4" transform="rotate(${definition.rotation} 400 500)" />
      <g transform="rotate(${definition.rotation} 400 500)">${lineMarkup}</g>
      <text x="744" y="956" text-anchor="end" font-family="Arial, Helvetica, sans-serif" font-size="18" letter-spacing="2" fill="#3f3f3f" opacity="0.55">NO KINGS PROTEST SIGNS</text>
    </svg>
  `

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg.replace(/\s+/g, ' ').trim())}`
}
