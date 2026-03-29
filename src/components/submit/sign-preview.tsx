import { getPreviewLines, normalizePreviewSlogan, type SignTemplateId } from '@/src/lib/signs/templates'
import { SignWatermark } from '@/src/components/signs/sign-watermark'

type SignPreviewProps = {
  slogan: string
  template: SignTemplateId
}

export function SignPreview({ slogan, template }: SignPreviewProps) {
  const previewText = normalizePreviewSlogan(slogan)
  const lines = getPreviewLines(previewText)

  return (
    <div className="sign-preview" data-template={template} data-testid="sign-preview-root">
      <div className={`sign-preview__board sign-preview__board--${template}`}>
        <p className="sign-preview__full-slogan">{previewText}</p>
        <div className="sign-preview__poster">
          {lines.map((line, index) => (
            <p key={`${line}-${index}`} className="sign-preview__line">
              {line}
            </p>
          ))}
          <SignWatermark className="sign-watermark--preview" />
        </div>
      </div>
    </div>
  )
}
