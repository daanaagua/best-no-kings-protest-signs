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
}

export function SignPreview({ slogan, template, textRotation }: SignPreviewProps) {
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
