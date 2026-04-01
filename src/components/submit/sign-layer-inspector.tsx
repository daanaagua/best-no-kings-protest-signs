import {
  SIGN_TEMPLATE_IDS,
  getSignTemplateDefinition,
  type SignTemplateId,
} from '@/src/lib/signs/templates'
import type {
  SignBoardDocument,
  SignBoardImageLayer,
  SignBoardLayer,
  SignBoardTextLayer,
} from '@/src/lib/signs/board-document'

type SignLayerInspectorProps = {
  board: SignBoardDocument
  selectedLayer: SignBoardLayer | undefined
  onTemplateChange: (templateId: SignTemplateId) => void
  onUpdateTextLayer: (updates: Partial<SignBoardTextLayer>) => void
  onUpdateImageLayer: (updates: Partial<SignBoardImageLayer>) => void
  onUpdateLayerFrame: (updates: Partial<Pick<SignBoardLayer, 'x' | 'y' | 'width' | 'height' | 'rotation'>>) => void
  onToggleVisibility: () => void
}

export function SignLayerInspector({
  board,
  selectedLayer,
  onTemplateChange,
  onUpdateTextLayer,
  onUpdateImageLayer,
  onUpdateLayerFrame,
  onToggleVisibility,
}: SignLayerInspectorProps) {
  return (
    <section className="sign-layer-inspector">
      <div className="section-heading section-heading--compact">
        <p className="section-heading__eyebrow">Inspector</p>
        <h2 className="section-heading__title">Tune the selected layer</h2>
      </div>

      <fieldset className="submit-fieldset">
        <legend className="submit-field__label">Template switcher</legend>
        <div className="template-switcher sign-template-switcher" role="list">
          {SIGN_TEMPLATE_IDS.map((templateId) => {
            const template = getSignTemplateDefinition(templateId)

            return (
              <label key={templateId} className="template-switcher__option" role="listitem">
                <input
                  checked={board.templateId === templateId}
                  name="designerTemplate"
                  onChange={() => onTemplateChange(templateId)}
                  type="radio"
                  value={templateId}
                />
                <span className="template-switcher__title">{template.label}</span>
                <span className="template-switcher__description">{template.description}</span>
              </label>
            )
          })}
        </div>
      </fieldset>

      {selectedLayer ? (
        <div className="sign-layer-inspector__controls">
          {selectedLayer.type === 'text' ? (
            <label className="submit-field">
              <span className="submit-field__label">Layer text</span>
              <textarea
                aria-label="Layer text"
                className="submit-field__input submit-field__input--textarea"
                onChange={(event) => onUpdateTextLayer({ text: event.target.value })}
                rows={4}
                value={selectedLayer.text}
              />
            </label>
          ) : (
            <label className="submit-field">
              <span className="submit-field__label">Image alt</span>
              <input
                aria-label="Image alt"
                className="submit-field__input"
                onChange={(event) => onUpdateImageLayer({ alt: event.target.value })}
                type="text"
                value={selectedLayer.alt}
              />
            </label>
          )}

          <label className="submit-field">
            <span className="submit-field__label">Layer X position</span>
            <input
              aria-label="Layer X position"
              className="submit-field__input"
              onChange={(event) => onUpdateLayerFrame({ x: Number(event.target.value) || 0 })}
              type="number"
              value={Math.round(selectedLayer.x)}
            />
          </label>

          <label className="submit-field">
            <span className="submit-field__label">Layer Y position</span>
            <input
              aria-label="Layer Y position"
              className="submit-field__input"
              onChange={(event) => onUpdateLayerFrame({ y: Number(event.target.value) || 0 })}
              type="number"
              value={Math.round(selectedLayer.y)}
            />
          </label>

          <label className="submit-field">
            <span className="submit-field__label">Layer width</span>
            <input
              aria-label="Layer width"
              className="submit-field__input"
              onChange={(event) => onUpdateLayerFrame({ width: Number(event.target.value) || 0 })}
              type="number"
              value={Math.round(selectedLayer.width)}
            />
          </label>

          <label className="submit-field">
            <span className="submit-field__label">Layer height</span>
            <input
              aria-label="Layer height"
              className="submit-field__input"
              onChange={(event) => onUpdateLayerFrame({ height: Number(event.target.value) || 0 })}
              type="number"
              value={Math.round(selectedLayer.height)}
            />
          </label>

          <label className="submit-field">
            <span className="submit-field__label">Layer rotation</span>
            <input
              aria-label="Layer rotation"
              className="submit-field__input"
              onChange={(event) => onUpdateLayerFrame({ rotation: Number(event.target.value) || 0 })}
              type="number"
              value={Math.round(selectedLayer.rotation)}
            />
          </label>

          <button className="home-hero__secondary" onClick={onToggleVisibility} type="button">
            {selectedLayer.visible ? 'Hide layer' : 'Show layer'}
          </button>
        </div>
      ) : null}
    </section>
  )
}
