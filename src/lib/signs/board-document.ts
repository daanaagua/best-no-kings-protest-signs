import {
  DEFAULT_TEXT_ROTATION,
  DEFAULT_TEXT_SCALE,
  getSignTemplateDefinition,
  getTextColorValue,
  type SignTemplateId,
  type TextColorOptionId,
} from '@/src/lib/signs/templates'

export const BOARD_DOCUMENT_VERSION = 1 as const
export const BOARD_CANVAS_WIDTH = 800
export const BOARD_CANVAS_HEIGHT = 1000

export type BoardBackgroundMode = 'template-art' | 'blank-board'

export type BoardBackgroundAsset =
  | {
      kind: 'template'
      src: string
    }
  | {
      kind: 'solid'
      color: string
    }

export type SignBoardLayerTransform = {
  scaleX: number
  scaleY: number
  skewX?: number
  skewY?: number
  distort?: unknown
}

export type SignBoardLayerBase = {
  id: string
  name: string
  x: number
  y: number
  width: number
  height: number
  rotation: number
  opacity: number
  visible: boolean
  locked: boolean
  transform: SignBoardLayerTransform
}

export type SignBoardTextPadding = {
  top: number
  right: number
  bottom: number
  left: number
}

export type SignBoardTextLayer = SignBoardLayerBase & {
  type: 'text'
  text: string
  fontFamily: string
  fontWeight: number
  letterSpacing: number
  color: string
  fontSize: number
  lineHeight: number
  textAlign: 'left' | 'center' | 'right'
  textTransformMode: 'none' | 'uppercase'
  padding: SignBoardTextPadding
  autoFit: boolean
}

export type SignBoardImageLayer = SignBoardLayerBase & {
  type: 'image'
  imageAssetId: string
  naturalWidth: number
  naturalHeight: number
  alt: string
  fitMode: 'contain' | 'cover'
}

export type SignBoardLayer = SignBoardTextLayer | SignBoardImageLayer

export type SubmissionAssetRecord = {
  id: string
  mimeType: string
  originalFileName: string
  storageType: 'inline-data-url'
  dataUrl: string
  fileSizeBytes: number
  naturalWidth: number
  naturalHeight: number
}

export type SignBoardDocument = {
  version: typeof BOARD_DOCUMENT_VERSION
  templateId: SignTemplateId
  backgroundMode: BoardBackgroundMode
  backgroundAsset: BoardBackgroundAsset
  canvasWidth: number
  canvasHeight: number
  layers: SignBoardLayer[]
}

type LegacyTextBoardInput = {
  slogan: string
  selectedTemplate: SignTemplateId
  selectedTextColor?: TextColorOptionId
  textRotation?: number
  textOffsetY?: number
  textScale?: number
}

function createLayerId(prefix: 'text' | 'image') {
  const generatedId = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`

  return `${prefix}-${generatedId}`
}

function createBaseLayer(name: string): SignBoardLayerBase {
  return {
    id: createLayerId('text'),
    name,
    x: BOARD_CANVAS_WIDTH / 2,
    y: BOARD_CANVAS_HEIGHT / 2,
    width: 480,
    height: 220,
    rotation: 0,
    opacity: 1,
    visible: true,
    locked: false,
    transform: {
      scaleX: 1,
      scaleY: 1,
    },
  }
}

export function createTextLayer(overrides: Partial<SignBoardTextLayer> = {}): SignBoardTextLayer {
  const baseLayer = createBaseLayer('Text layer')

  return {
    ...baseLayer,
    type: 'text',
    text: 'Your slogan preview',
    fontFamily: 'Arial Black, Impact, sans-serif',
    fontWeight: 900,
    letterSpacing: 2,
    color: '#162635',
    fontSize: 54,
    lineHeight: 1.05,
    textAlign: 'center',
    textTransformMode: 'uppercase',
    padding: { top: 20, right: 20, bottom: 20, left: 20 },
    autoFit: true,
    ...overrides,
    id: overrides.id ?? createLayerId('text'),
    transform: {
      scaleX: 1,
      scaleY: 1,
      ...overrides.transform,
    },
  }
}

export function createImageLayer(overrides: Partial<SignBoardImageLayer>): SignBoardImageLayer {
  const baseLayer = createBaseLayer('Image layer')

  return {
    ...baseLayer,
    type: 'image',
    imageAssetId: overrides.imageAssetId ?? '',
    naturalWidth: overrides.naturalWidth ?? 1200,
    naturalHeight: overrides.naturalHeight ?? 900,
    alt: overrides.alt ?? 'Uploaded image',
    fitMode: 'contain',
    ...overrides,
    id: overrides.id ?? createLayerId('image'),
    transform: {
      scaleX: 1,
      scaleY: 1,
      ...overrides.transform,
    },
  }
}

function createBoardDocument(templateId: SignTemplateId, backgroundMode: BoardBackgroundMode): SignBoardDocument {
  const template = getSignTemplateDefinition(templateId)

  return {
    version: BOARD_DOCUMENT_VERSION,
    templateId,
    backgroundMode,
    backgroundAsset:
      backgroundMode === 'blank-board'
        ? { kind: 'solid', color: template.boardColor }
        : { kind: 'template', src: template.previewBackground },
    canvasWidth: BOARD_CANVAS_WIDTH,
    canvasHeight: BOARD_CANVAS_HEIGHT,
    layers: [],
  }
}

export function createBlankBoardDocument(): SignBoardDocument {
  const board = createBoardDocument('blank-white', 'blank-board')

  board.layers = [
    createTextLayer({
      name: 'Headline',
      width: 520,
      height: 240,
      color: '#111111',
    }),
  ]

  return board
}

export function createStarterBoardDocument(templateId: SignTemplateId): SignBoardDocument {
  if (templateId === 'blank-white') {
    return createBlankBoardDocument()
  }

  return createLegacyTextBoardDocument({
    slogan: 'Your slogan preview',
    selectedTemplate: templateId,
  })
}

export function getPrimaryBoardText(board: SignBoardDocument) {
  const primaryTextLayer = board.layers.find(
    (layer): layer is SignBoardTextLayer => layer.type === 'text' && layer.visible && layer.text.trim().length > 0,
  )

  return primaryTextLayer?.text.replace(/\s+/g, ' ').trim() || 'no-kings-sign'
}

export function createLegacyTextBoardDocument(input: LegacyTextBoardInput): SignBoardDocument {
  const template = getSignTemplateDefinition(input.selectedTemplate)
  const board = createBoardDocument(input.selectedTemplate, 'template-art')
  const color = getTextColorValue(input.selectedTextColor) ?? template.textColor
  const offsetY = typeof input.textOffsetY === 'number' ? input.textOffsetY : 0
  const scale = typeof input.textScale === 'number' && Number.isFinite(input.textScale) ? input.textScale : DEFAULT_TEXT_SCALE

  board.layers = [
    createTextLayer({
      name: 'Legacy slogan',
      text: input.slogan,
      color,
      rotation: typeof input.textRotation === 'number' ? input.textRotation : DEFAULT_TEXT_ROTATION,
      x: BOARD_CANVAS_WIDTH / 2,
      y: BOARD_CANVAS_HEIGHT / 2 + offsetY,
      width: Math.round(480 * scale),
      height: Math.round(220 * scale),
    }),
  ]

  return board
}
