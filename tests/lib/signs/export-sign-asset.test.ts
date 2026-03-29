import { afterEach, describe, expect, it, vi } from 'vitest'

import { exportSignAssetAsPng } from '@/src/lib/signs/export-sign-asset'

describe('exportSignAssetAsPng', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('draws a png asset to canvas and downloads a png file', async () => {
    const anchor = { click: vi.fn(), download: '', href: '' } as unknown as HTMLAnchorElement
    const drawImage = vi.fn()
    const canvas = {
      width: 0,
      height: 0,
      getContext: vi.fn(() => ({ drawImage })),
      toDataURL: vi.fn(() => 'data:image/png;base64,preview'),
    } as unknown as HTMLCanvasElement
    const originalCreateElement = document.createElement.bind(document)
    const fetchMock = vi.fn(() => Promise.resolve({ ok: true, blob: () => Promise.resolve(new Blob(['png'])) }))
    const createObjectURL = vi.fn(() => 'blob:preview-asset')
    const revokeObjectURL = vi.fn()
    let loadedSrc = ''

    vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      if (tagName === 'a') {
        return anchor
      }

      if (tagName === 'canvas') {
        return canvas
      }

      return originalCreateElement(tagName)
    })

    vi.stubGlobal('fetch', fetchMock)
    vi.stubGlobal('URL', {
      createObjectURL,
      revokeObjectURL,
    })

    class MockImage {
      naturalWidth = 1200
      naturalHeight = 1500
      onload: null | (() => void) = null

      set src(value: string) {
        loadedSrc = value
        this.onload?.()
      }
    }

    vi.stubGlobal('Image', MockImage)

    await exportSignAssetAsPng('/signs/no-crown-for-a-clown.png', 'No Crown for a Clown')

    expect(fetchMock).toHaveBeenCalledWith('/signs/no-crown-for-a-clown.png')
    expect(createObjectURL).toHaveBeenCalledTimes(1)
    expect(loadedSrc).toBe('blob:preview-asset')
    expect(canvas.width).toBe(1200)
    expect(canvas.height).toBe(1500)
    expect(drawImage).toHaveBeenCalledTimes(1)
    expect(canvas.toDataURL).toHaveBeenCalledWith('image/png')
    expect(anchor.download).toBe('no-crown-for-a-clown.png')
    expect(anchor.href).toBe('data:image/png;base64,preview')
    expect(anchor.click).toHaveBeenCalledTimes(1)
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:preview-asset')
  })

  it('keeps svg sign assets on the same png download path', async () => {
    const anchor = { click: vi.fn(), download: '', href: '' } as unknown as HTMLAnchorElement
    const canvas = {
      width: 0,
      height: 0,
      getContext: vi.fn(() => ({ drawImage: vi.fn() })),
      toDataURL: vi.fn(() => 'data:image/png;base64,community'),
    } as unknown as HTMLCanvasElement
    const originalCreateElement = document.createElement.bind(document)
    const fetchMock = vi.fn(() => Promise.resolve({ ok: true, blob: () => Promise.resolve(new Blob(['svg'])) }))
    const createObjectURL = vi.fn(() => 'blob:community-sign')
    const revokeObjectURL = vi.fn()
    let loadedSrc = ''

    vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      if (tagName === 'a') {
        return anchor
      }

      if (tagName === 'canvas') {
        return canvas
      }

      return originalCreateElement(tagName)
    })

    vi.stubGlobal('fetch', fetchMock)
    vi.stubGlobal('URL', {
      createObjectURL,
      revokeObjectURL,
    })

    class MockImage {
      naturalWidth = 900
      naturalHeight = 1200
      onload: null | (() => void) = null

      set src(value: string) {
        loadedSrc = value
        this.onload?.()
      }
    }

    vi.stubGlobal('Image', MockImage)

    await exportSignAssetAsPng('/signs/community-library-cards-over-crowns.svg', 'Library Cards Over Crowns')

    expect(fetchMock).toHaveBeenCalledWith('/signs/community-library-cards-over-crowns.svg')
    expect(loadedSrc).toBe('blob:community-sign')
    expect(anchor.download).toBe('library-cards-over-crowns.png')
    expect(anchor.click).toHaveBeenCalledTimes(1)
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:community-sign')
  })
})
