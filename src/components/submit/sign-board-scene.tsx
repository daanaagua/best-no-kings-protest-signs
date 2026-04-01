import Image from 'next/image'
import type { CSSProperties } from 'react'

import {
  type SignBoardDocument,
  type SignBoardImageLayer,
  type SubmissionAssetRecord,
} from '@/src/lib/signs/board-document'
import { getPreviewLines } from '@/src/lib/signs/templates'

type LegacyTextPresentation = {
  textRotation: number
  textOffsetY: number
  textScale: number
  textColor: string
  textFrameTop: string
  textFrameWidth: string
}

type SignBoardSceneProps = {
  board: SignBoardDocument
  assets?: SubmissionAssetRecord[]
  className?: string
  textLayerClassName?: string
  textLineClassName?: string
  imageLayerClassName?: string
  legacyTextPresentation?: LegacyTextPresentation
}

function resolveAsset(layer: SignBoardImageLayer, assets: SubmissionAssetRecord[]) {
  return assets.find((asset) => asset.id === layer.imageAssetId)
}

export function SignBoardScene({
  board,
  assets = [],
  className,
  textLayerClassName = 'sign-board-scene__text-layer',
  textLineClassName = 'sign-board-scene__line',
  imageLayerClassName = 'sign-board-scene__image-layer',
  legacyTextPresentation,
}: SignBoardSceneProps) {
  return (
    <div className={className ?? 'sign-board-scene'} data-testid="sign-board-scene">
      {board.layers.map((layer) => {
        if (!layer.visible) {
          return null
        }

        if (layer.type === 'text') {
          const lines = getPreviewLines(layer.text)
          const style: CSSProperties = legacyTextPresentation
            ? ({
                '--text-rotation': `${legacyTextPresentation.textRotation}deg`,
                '--text-offset-y': `${legacyTextPresentation.textOffsetY}px`,
                '--text-scale': `${legacyTextPresentation.textScale}`,
                '--text-color': legacyTextPresentation.textColor,
                '--text-frame-top': legacyTextPresentation.textFrameTop,
                '--text-frame-width': legacyTextPresentation.textFrameWidth,
              } as CSSProperties)
            : {
                position: 'absolute',
                left: layer.x - layer.width / 2,
                top: layer.y - layer.height / 2,
                width: layer.width,
                minHeight: layer.height,
                opacity: layer.opacity,
                transform: `rotate(${layer.rotation}deg)`,
                transformOrigin: 'center center',
                color: layer.color,
              }

          return (
            <div key={layer.id} className={textLayerClassName} style={style}>
              {lines.map((line, index) => (
                <p key={`${layer.id}-${index}`} className={textLineClassName}>
                  {line}
                </p>
              ))}
            </div>
          )
        }

        const asset = resolveAsset(layer, assets)

        if (!asset) {
          return null
        }

        return (
          <Image
            key={layer.id}
            alt={layer.alt}
            className={imageLayerClassName}
            height={layer.height}
            src={asset.dataUrl}
            unoptimized
            width={layer.width}
            style={{
              position: 'absolute',
              left: layer.x - layer.width / 2,
              top: layer.y - layer.height / 2,
              width: layer.width,
              height: layer.height,
              objectFit: layer.fitMode,
              opacity: layer.opacity,
              transform: `rotate(${layer.rotation}deg)`,
              transformOrigin: 'center center',
            }}
          />
        )
      })}
    </div>
  )
}
