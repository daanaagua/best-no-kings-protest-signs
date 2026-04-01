export const BLANK_BOARD_RATIO_PRESETS = [
  { id: 'square-1-1', label: '1:1', canvasWidth: 1000, canvasHeight: 1000 },
  { id: 'portrait-4-5', label: '4:5', canvasWidth: 800, canvasHeight: 1000 },
  { id: 'poster-3-4', label: '3:4', canvasWidth: 900, canvasHeight: 1200 },
  { id: 'landscape-4-3', label: '4:3', canvasWidth: 1200, canvasHeight: 900 },
  { id: 'widescreen-16-9', label: '16:9', canvasWidth: 1600, canvasHeight: 900 },
] as const

export type BlankBoardRatioPreset = (typeof BLANK_BOARD_RATIO_PRESETS)[number]
export type BlankBoardRatioId = BlankBoardRatioPreset['id']

export const DEFAULT_BLANK_BOARD_RATIO_ID: BlankBoardRatioId = 'portrait-4-5'

export function getBlankBoardRatioPreset(ratioId: BlankBoardRatioId = DEFAULT_BLANK_BOARD_RATIO_ID) {
  return (
    BLANK_BOARD_RATIO_PRESETS.find((preset) => preset.id === ratioId) ??
    BLANK_BOARD_RATIO_PRESETS.find((preset) => preset.id === DEFAULT_BLANK_BOARD_RATIO_ID)!
  )
}

export function getBlankBoardRatioIdForDimensions(canvasWidth: number, canvasHeight: number): BlankBoardRatioId {
  return (
    BLANK_BOARD_RATIO_PRESETS.find(
      (preset) => preset.canvasWidth === canvasWidth && preset.canvasHeight === canvasHeight,
    )?.id ?? DEFAULT_BLANK_BOARD_RATIO_ID
  )
}
