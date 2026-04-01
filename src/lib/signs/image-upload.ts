import type { SubmissionAssetRecord } from '@/src/lib/signs/board-document'

export async function readImageFileAsDataUrl(file: File) {
  const result = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()

    reader.onerror = () => reject(new Error('Unable to read the selected image.'))
    reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '')
    reader.readAsDataURL(file)
  })

  if (!result) {
    throw new Error('Unable to read the selected image.')
  }

  return result
}

export async function createSubmissionAssetFromFile(file: File): Promise<SubmissionAssetRecord> {
  const dataUrl = await readImageFileAsDataUrl(file)

  return {
    id: globalThis.crypto?.randomUUID?.() ?? `asset-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    mimeType: file.type || 'image/png',
    originalFileName: file.name,
    storageType: 'inline-data-url',
    dataUrl,
    fileSizeBytes: file.size,
    naturalWidth: 1200,
    naturalHeight: 900,
  }
}
