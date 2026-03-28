import { getPreviewLines, getSignTemplateDefinition, normalizePreviewSlogan, type SignTemplateId } from '@/src/lib/signs/templates'

type SignPreviewProps = {
  slogan: string
  template: SignTemplateId
}

export function SignPreview({ slogan, template }: SignPreviewProps) {
  const definition = getSignTemplateDefinition(template)
  const previewText = normalizePreviewSlogan(slogan)
  const lines = getPreviewLines(previewText)

  return (
    <div className="sign-preview" data-template={template} data-testid="sign-preview-root">
      <div className={`sign-preview__board sign-preview__board--${template}`}>
        <p className="sign-preview__template-label">{definition.label}</p>
        <p className="sign-preview__full-slogan">{previewText}</p>
        <div className="sign-preview__poster">
          {lines.map((line, index) => (
            <p key={`${line}-${index}`} className="sign-preview__line">
              {line}
            </p>
          ))}
        </div>
        <div className="sign-preview__stick" aria-hidden="true" />
      </div>
    </div>
  )
}
