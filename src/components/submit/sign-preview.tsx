import {
  getSignTemplateDefinition,
  type SignTemplateId,
} from '@/src/lib/signs/templates'
import { createLegacyTextBoardDocument } from '@/src/lib/signs/board-document'
import { SignBoardScene } from '@/src/components/submit/sign-board-scene'
import { SignWatermark } from '@/src/components/signs/sign-watermark'

type SignPreviewProps = {
  slogan: string
  template: SignTemplateId
  textRotation: number
  textOffsetY: number
  textScale: number
  textColor: string
}

export function SignPreview({ slogan, template, textRotation, textOffsetY, textScale, textColor }: SignPreviewProps) {
  const definition = getSignTemplateDefinition(template)
  const board = createLegacyTextBoardDocument({
    slogan,
    selectedTemplate: template,
    textRotation,
    textOffsetY,
    textScale,
  })

  const firstTextLayer = board.layers[0]

  if (firstTextLayer?.type === 'text') {
    firstTextLayer.color = textColor
  }

  return (
    <div className="sign-preview" data-template={template} data-testid="sign-preview-root">
      <div className={`sign-preview__board sign-preview__board--${template}`}>
        <p className="sign-preview__full-slogan">{slogan.replace(/\s+/g, ' ').trim() || 'Your slogan preview'}</p>
        <div className="sign-preview__poster" style={{ backgroundImage: `url(${definition.previewBackground})` }}>
          <SignBoardScene
            board={board}
            className="sign-preview__scene"
            legacyTextPresentation={{
              textRotation,
              textOffsetY,
              textScale,
              textColor,
              textFrameTop: definition.textFrameTop,
              textFrameWidth: definition.textFrameWidth,
            }}
            textLayerClassName="sign-preview__text-layer"
            textLineClassName="sign-preview__line"
          />
          <SignWatermark className="sign-watermark--preview" />
        </div>
      </div>
    </div>
  )
}
