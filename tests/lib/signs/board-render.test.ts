import { describe, expect, it } from 'vitest'

import {
  createBlankBoardDocument,
  createImageLayer,
  createTextLayer,
  type SubmissionAssetRecord,
} from '@/src/lib/signs/board-document'
import { renderBoardToSvgDataUrl } from '@/src/lib/signs/board-render'

function decodeSvgAsset(dataUrl: string) {
  return decodeURIComponent(dataUrl.replace('data:image/svg+xml;charset=UTF-8,', ''))
}

describe('renderBoardToSvgDataUrl', () => {
  it('renders text and image layers from a board document', () => {
    const board = createBlankBoardDocument()
    const assets: SubmissionAssetRecord[] = [
      {
        id: 'asset-1',
        mimeType: 'image/png',
        originalFileName: 'poster.png',
        storageType: 'inline-data-url',
        dataUrl: 'data:image/png;base64,abc123',
      },
    ]

    board.layers = [
      createTextLayer({ text: 'No Kings' }),
      createImageLayer({
        imageAssetId: 'asset-1',
        naturalWidth: 1200,
        naturalHeight: 900,
        x: 120,
        y: 180,
      }),
    ]

    const svg = decodeSvgAsset(renderBoardToSvgDataUrl(board, assets))

    expect(svg).toContain('No Kings')
    expect(svg).toContain('data:image/png;base64,abc123')
  })
})
