import {
  getPreviewLines,
  getSignTemplateDefinition,
  normalizePreviewSlogan,
  type SignTemplateId,
} from '@/src/lib/signs/templates'
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
  const previewText = normalizePreviewSlogan(slogan)
  const lines = getPreviewLines(previewText)

  return (
    <div className="sign-preview" data-template={template} data-testid="sign-preview-root">
      <div className={`sign-preview__board sign-preview__board--${template}`}>
        <p className="sign-preview__full-slogan">{previewText}</p>
        <div className="sign-preview__poster" style={{ backgroundImage: `url(${definition.previewBackground})` }}>
          <div
            className="sign-preview__text-layer"
            style={
              {
                '--text-rotation': `${textRotation}deg`,
                '--text-offset-y': `${textOffsetY}px`,
                '--text-scale': `${textScale}`,
                '--text-color': textColor,
                '--text-frame-top': definition.textFrameTop,
                '--text-frame-width': definition.textFrameWidth,
              } as React.CSSProperties
            }
          >
            {lines.map((line, index) => (
              <p key={`${line}-${index}`} className="sign-preview__line">
                {line}
              </p>
            ))}
          </div>
          <SignWatermark className="sign-watermark--preview" />
        </div>
      </div>
    </div>
  )
}
