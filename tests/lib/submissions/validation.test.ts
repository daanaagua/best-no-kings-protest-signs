import { describe, expect, it } from 'vitest'

import {
  createBlankBoardDocument,
  createImageLayer,
  createTextLayer,
} from '@/src/lib/signs/board-document'
import { validateSubmission } from '@/src/lib/submissions/validation'

describe('validateSubmission', () => {
  it('accepts a valid layered board payload', () => {
    const boardDocument = createBlankBoardDocument()

    boardDocument.layers = [
      createTextLayer({ text: 'Let voters steer' }),
      createImageLayer({ imageAssetId: 'asset-1', naturalWidth: 1200, naturalHeight: 900 }),
    ]

    const result = validateSubmission({
      boardDocument,
      submissionAssets: [
        {
          id: 'asset-1',
          mimeType: 'image/png',
          originalFileName: 'poster.png',
          storageType: 'inline-data-url',
          dataUrl: 'data:image/png;base64,abc123',
          fileSizeBytes: 1024,
          naturalWidth: 1200,
          naturalHeight: 900,
        },
      ],
      acceptedPolicy: true,
      confirmedOwnership: true,
    })

    expect(result.success).toBe(true)

    if (!result.success) {
      throw new Error('expected validation to succeed')
    }

    expect(result.value).toMatchObject({
      slogan: 'Let voters steer',
      slugCandidate: 'let-voters-steer',
      selectedTemplate: 'blank-white',
      submissionAssets: [
        {
          id: 'asset-1',
        },
      ],
    })
  })

  it('rejects a board with no visible layers', () => {
    const boardDocument = createBlankBoardDocument()
    boardDocument.layers = []

    const result = validateSubmission({
      boardDocument,
      submissionAssets: [],
      acceptedPolicy: true,
      confirmedOwnership: true,
    })

    expect(result.success).toBe(false)
    expect(result.errors.boardDocument).toMatch(/visible layer/i)
  })

  it('rejects image assets above the file-size and dimension ceilings', () => {
    const boardDocument = createBlankBoardDocument()
    boardDocument.layers = [createImageLayer({ imageAssetId: 'asset-oversized' })]

    const result = validateSubmission({
      boardDocument,
      submissionAssets: [
        {
          id: 'asset-oversized',
          mimeType: 'image/png',
          originalFileName: 'huge.png',
          storageType: 'inline-data-url',
          dataUrl: 'data:image/png;base64,abc123',
          fileSizeBytes: 10_000_000,
          naturalWidth: 5000,
          naturalHeight: 5000,
        },
      ],
      acceptedPolicy: true,
      confirmedOwnership: true,
    })

    expect(result.success).toBe(false)
    expect(result.errors.submissionAssets).toMatch(/file size|dimensions/i)
  })

  it('rejects image layers whose asset references do not resolve', () => {
    const boardDocument = createBlankBoardDocument()
    boardDocument.layers = [createImageLayer({ imageAssetId: 'missing-asset' })]

    const result = validateSubmission({
      boardDocument,
      submissionAssets: [],
      acceptedPolicy: true,
      confirmedOwnership: true,
    })

    expect(result.success).toBe(false)
    expect(result.errors.boardDocument).toMatch(/image asset/i)
  })
})
