'use client'

import { useState } from 'react'

import { exportSignAssetAsPng } from '@/src/lib/signs/export-sign-asset'

type DownloadSignButtonProps = {
  assetUrl: string
  title: string
}

export function DownloadSignButton({ assetUrl, title }: DownloadSignButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')

  async function handleClick() {
    if (isDownloading) {
      return
    }

    try {
      setIsDownloading(true)
      setStatusMessage('')
      await exportSignAssetAsPng(assetUrl, title)
    } catch {
      setStatusMessage('PNG download failed. Open the image in a new tab and save it manually.')
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <>
      <button className="site-cta sign-detail__download" onClick={handleClick} type="button">
        {isDownloading ? 'Preparing PNG...' : 'Download PNG'}
      </button>
      {statusMessage ? (
        <p className="sign-detail__download-status" role="status">
          {statusMessage}
        </p>
      ) : null}
    </>
  )
}
