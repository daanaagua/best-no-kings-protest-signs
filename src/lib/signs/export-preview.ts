import { toPng } from 'html-to-image'

function triggerDownload(dataUrl: string, fileName: string) {
  const link = document.createElement('a')
  link.download = fileName
  link.href = dataUrl
  link.click()
}

export function buildExportFileName(slogan: string) {
  const slug = slogan
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return `${slug || 'no-kings-sign'}.png`
}

export async function exportPreviewAsPng(element: HTMLElement, fileName: string) {
  const dataUrl = await toPng(element, {
    cacheBust: true,
    pixelRatio: 2,
    backgroundColor: '#f5ede1',
  })

  triggerDownload(dataUrl, fileName)
}
