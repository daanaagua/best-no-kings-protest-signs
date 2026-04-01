import { describe, expect, it } from 'vitest'

import { createBlankBoardDocument, createStarterBoardDocument } from '@/src/lib/signs/board-document'
import {
  BLANK_BOARD_RATIO_PRESETS,
  DEFAULT_BLANK_BOARD_RATIO_ID,
} from '@/src/lib/signs/blank-board-ratios'

describe('blank board ratios', () => {
  it('defines the supported blank board ratio presets', () => {
    expect(DEFAULT_BLANK_BOARD_RATIO_ID).toBe('portrait-4-5')
    expect(BLANK_BOARD_RATIO_PRESETS.map((preset) => preset.id)).toEqual([
      'square-1-1',
      'portrait-4-5',
      'poster-3-4',
      'landscape-4-3',
      'widescreen-16-9',
    ])
  })

  it('creates the blank board with the default ratio preset dimensions', () => {
    const board = createBlankBoardDocument()

    expect(board.canvasWidth).toBe(800)
    expect(board.canvasHeight).toBe(1000)
    expect(board.backgroundAsset).toEqual({ kind: 'solid', color: '#f5f0e6' })
  })

  it('uses the blank board as the default starter board', () => {
    const board = createStarterBoardDocument()
    expect(board.templateId).toBe('blank-white')
  })

  it('keeps the blank board starter text layer centered in the default preset', () => {
    const board = createBlankBoardDocument()
    expect(board.layers[0]).toMatchObject({ x: 400, y: 500 })
  })
})
