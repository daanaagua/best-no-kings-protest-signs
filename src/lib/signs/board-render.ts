import {
  type SignBoardDocument,
  type SignBoardImageLayer,
  type SignBoardLayer,
  type SignBoardTextLayer,
  type SubmissionAssetRecord,
} from '@/src/lib/signs/board-document'
import { getPreviewLines } from '@/src/lib/signs/templates'

function escapeSvgText(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function resolveImageAsset(layer: SignBoardImageLayer, assets: SubmissionAssetRecord[]) {
  return assets.find((asset) => asset.id === layer.imageAssetId)
}

function renderTextLayerSvg(layer: SignBoardTextLayer) {
  const lines = getPreviewLines(layer.text)
  const fontSize = layer.fontSize
  const lineHeight = Math.round(fontSize * layer.lineHeight)
  const totalHeight = lineHeight * Math.max(lines.length - 1, 0)
  const startY = layer.y - totalHeight / 2

  return lines
    .map((line, index) => {
      const y = startY + index * lineHeight

      return `<text x="${layer.x}" y="${y}" text-anchor="middle" font-family="${escapeSvgText(layer.fontFamily)}" font-size="${fontSize}" font-weight="${layer.fontWeight}" letter-spacing="${layer.letterSpacing}" fill="${layer.color}">${escapeSvgText(line)}</text>`
    })
    .join('')
}

function renderImageLayerSvg(layer: SignBoardImageLayer, assets: SubmissionAssetRecord[]) {
  const asset = resolveImageAsset(layer, assets)

  if (!asset) {
    return ''
  }

  return `<image href="${asset.dataUrl}" x="${layer.x - layer.width / 2}" y="${layer.y - layer.height / 2}" width="${layer.width}" height="${layer.height}" preserveAspectRatio="xMidYMid meet" />`
}

function renderLayerSvg(layer: SignBoardLayer, assets: SubmissionAssetRecord[]) {
  if (!layer.visible) {
    return ''
  }

  const markup =
    layer.type === 'text' ? renderTextLayerSvg(layer) : renderImageLayerSvg(layer, assets)

  if (!markup) {
    return ''
  }

  return `<g transform="rotate(${layer.rotation} ${layer.x} ${layer.y})" opacity="${layer.opacity}">${markup}</g>`
}

export function renderBoardToSvgDataUrl(board: SignBoardDocument, assets: SubmissionAssetRecord[] = []) {
  const backgroundMarkup =
    board.backgroundAsset.kind === 'template'
      ? `<image href="${board.backgroundAsset.src}" x="0" y="0" width="${board.canvasWidth}" height="${board.canvasHeight}" preserveAspectRatio="xMidYMid slice" />`
      : `<rect width="${board.canvasWidth}" height="${board.canvasHeight}" fill="${board.backgroundAsset.color}" />`

  const layersMarkup = board.layers.map((layer) => renderLayerSvg(layer, assets)).join('')

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${board.canvasWidth}" height="${board.canvasHeight}" viewBox="0 0 ${board.canvasWidth} ${board.canvasHeight}">${backgroundMarkup}${layersMarkup}</svg>`,
  )}`
}
