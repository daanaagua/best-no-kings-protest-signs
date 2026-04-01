import { describe, expect, it } from 'vitest'

import {
  BOARD_DOCUMENT_VERSION,
  createBlankBoardDocument,
  createLegacyTextBoardDocument,
} from '@/src/lib/signs/board-document'

describe('board document helpers', () => {
  it('creates the blank white board preset with one starter text layer', () => {
    const board = createBlankBoardDocument()

    expect(board.version).toBe(BOARD_DOCUMENT_VERSION)
    expect(board.templateId).toBe('blank-white')
    expect(board.backgroundMode).toBe('blank-board')
    expect(board.layers).toHaveLength(1)
    expect(board.layers[0]).toMatchObject({
      type: 'text',
      text: 'Your slogan preview',
      rotation: 0,
      visible: true,
      locked: false,
    })
  })

  it('converts a legacy slogan submission into a one-layer board document', () => {
    const board = createLegacyTextBoardDocument({
      slogan: 'Power to the Public',
      selectedTemplate: 'classic',
      textRotation: 8,
      textOffsetY: 12,
      textScale: 1.14,
      selectedTextColor: 'signal-red',
    })

    expect(board.templateId).toBe('classic')
    expect(board.backgroundMode).toBe('template-art')
    expect(board.layers).toHaveLength(1)
    expect(board.layers[0]).toMatchObject({
      type: 'text',
      text: 'Power to the Public',
      rotation: 8,
      y: 512,
      transform: {
        scaleX: 1,
        scaleY: 1,
      },
    })
  })
})
