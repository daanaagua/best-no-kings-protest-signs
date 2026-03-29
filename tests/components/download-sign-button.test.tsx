import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { DownloadSignButton } from '@/src/components/signs/download-sign-button'

type ExportSignAssetAsPng =
  typeof import('@/src/lib/signs/export-sign-asset')['exportSignAssetAsPng']

const exportSignAssetAsPng = vi.fn<ExportSignAssetAsPng>().mockResolvedValue(undefined)

vi.mock('@/src/lib/signs/export-sign-asset', () => ({
  exportSignAssetAsPng: (...args: Parameters<ExportSignAssetAsPng>) => exportSignAssetAsPng(...args),
}))

describe('DownloadSignButton', () => {
  afterEach(() => {
    exportSignAssetAsPng.mockReset()
    exportSignAssetAsPng.mockResolvedValue(undefined)
  })

  it('exports the current sign asset as a png', async () => {
    render(
      <DownloadSignButton
        assetUrl="/signs/no-crown-for-a-clown.png"
        title="No Crown for a Clown"
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: /Download PNG/i }))

    await waitFor(() => {
      expect(exportSignAssetAsPng).toHaveBeenCalledTimes(1)
    })

    expect(exportSignAssetAsPng).toHaveBeenCalledWith('/signs/no-crown-for-a-clown.png', 'No Crown for a Clown')
  })

  it('shows a helpful status when png export fails', async () => {
    exportSignAssetAsPng.mockRejectedValueOnce(new Error('network down'))

    render(
      <DownloadSignButton
        assetUrl="https://cdn.example.com/community-sign.svg"
        title="Community Sign"
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: /Download PNG/i }))

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent(/png download failed/i)
    })
  })
})
