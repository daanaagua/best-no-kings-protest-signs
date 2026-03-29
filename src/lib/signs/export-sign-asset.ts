import { buildExportFileName } from '@/src/lib/signs/export-preview'

function triggerDownload(dataUrl: string, fileName: string) {
  const link = document.createElement('a')
  link.download = fileName
  link.href = dataUrl
  link.click()
}

function loadImage(objectUrl: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()

    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Unable to load sign asset into the export canvas.'))
    image.src = objectUrl
  })
}

export async function exportSignAssetAsPng(assetUrl: string, title: string) {
  const response = await fetch(assetUrl)

  if (!response.ok) {
    throw new Error(`Unable to download sign asset: ${assetUrl}`)
  }

  const blob = await response.blob()
  const objectUrl = URL.createObjectURL(blob)
  const image = await loadImage(objectUrl)
  const canvas = document.createElement('canvas')
  const width = image.naturalWidth || image.width
  const height = image.naturalHeight || image.height
  const context = canvas.getContext('2d')

  if (!context || !width || !height) {
    URL.revokeObjectURL(objectUrl)
    throw new Error('Unable to prepare sign export canvas.')
  }

  canvas.width = width
  canvas.height = height
  context.drawImage(image, 0, 0, width, height)

  triggerDownload(canvas.toDataURL('image/png'), buildExportFileName(title))
  URL.revokeObjectURL(objectUrl)
}
