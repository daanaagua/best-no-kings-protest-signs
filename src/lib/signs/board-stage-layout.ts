import type { SignBoardDocument, SignBoardLayer } from '@/src/lib/signs/board-document'

function formatBoardPercent(value: number, total: number) {
  if (!Number.isFinite(value) || !Number.isFinite(total) || total <= 0) {
    return '0%'
  }

  const percent = (value / total) * 100
  const rounded = Number(percent.toFixed(4))

  return `${rounded}%`
}

export function getBoardLayerFrameStyle(board: SignBoardDocument, layer: SignBoardLayer) {
  return {
    left: formatBoardPercent(layer.x - layer.width / 2, board.canvasWidth),
    top: formatBoardPercent(layer.y - layer.height / 2, board.canvasHeight),
    width: formatBoardPercent(layer.width, board.canvasWidth),
    height: formatBoardPercent(layer.height, board.canvasHeight),
  }
}

export function getBoardPointStyle(board: SignBoardDocument, x: number, y: number) {
  return {
    left: formatBoardPercent(x, board.canvasWidth),
    top: formatBoardPercent(y, board.canvasHeight),
  }
}
