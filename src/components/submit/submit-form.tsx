'use client'

import { useMemo, useState } from 'react'

import {
  SIGN_TEMPLATE_IDS,
  getSignTemplateDefinition,
  type SignTemplateId,
} from '@/src/lib/signs/templates'
import { SignPreview } from '@/src/components/submit/sign-preview'
import { PUBLIC_SUBMISSION_BETA_MESSAGE } from '@/src/lib/launch-mode'

type SubmissionFormState = {
  slogan: string
  selectedTemplate: SignTemplateId
  textRotation: number
}

const INITIAL_FORM_STATE: SubmissionFormState = {
  slogan: '',
  selectedTemplate: 'classic',
  textRotation: 0,
}

export function SubmitForm() {
  const [formState, setFormState] = useState<SubmissionFormState>(INITIAL_FORM_STATE)
  const selectedTemplate = useMemo(
    () => getSignTemplateDefinition(formState.selectedTemplate),
    [formState.selectedTemplate],
  )

  function updateField<K extends keyof SubmissionFormState>(key: K, value: SubmissionFormState[K]) {
    setFormState((currentState) => ({
      ...currentState,
      [key]: value,
    }))
  }

  return (
    <div className="submit-layout">
      <div className="submit-form">
        <div className="section-heading section-heading--compact">
          <p className="section-heading__eyebrow">Submit beta</p>
          <h2 className="section-heading__title" id="submit-form-title">
            Preview your sign while public submissions are in beta
          </h2>
          <p className="section-heading__description">
            Try slogans, switch templates, and use the live board preview now. Static launch keeps public server writes off until the archive settles.
          </p>
        </div>

        <label className="submit-field">
          <span className="submit-field__label">Slogan</span>
          <textarea
            className="submit-field__input submit-field__input--textarea"
            name="slogan"
            onChange={(event) => updateField('slogan', event.target.value)}
            placeholder="No crowns. No thrones. Just voters."
            rows={4}
            value={formState.slogan}
          />
        </label>

        <fieldset className="submit-fieldset">
          <legend className="submit-field__label">Template switcher</legend>
          <div className="template-switcher" role="list">
            {SIGN_TEMPLATE_IDS.map((templateId) => {
              const template = getSignTemplateDefinition(templateId)
              const isSelected = formState.selectedTemplate === templateId

                return (
                  <label key={templateId} className={`template-switcher__option ${isSelected ? 'template-switcher__option--selected' : ''}`} role="listitem">
                    <input
                    checked={isSelected}
                    name="selectedTemplate"
                    onChange={() => updateField('selectedTemplate', templateId)}
                      type="radio"
                      value={templateId}
                    />
                    <span
                      aria-hidden="true"
                      className="template-switcher__art"
                      style={{ backgroundImage: `url(${template.previewBackground})` }}
                    />
                    <span className="template-switcher__title">{template.label}</span>
                    <span className="template-switcher__description">{template.description}</span>
                  </label>
              )
            })}
          </div>
        </fieldset>

        <label className="submit-field">
          <span className="submit-field__label submit-field__label--row">
            <span>Text angle</span>
            <strong>{formState.textRotation}°</strong>
          </span>
          <input
            aria-label="Text angle"
            className="submit-field__range"
            max={30}
            min={-30}
            name="textRotation"
            onChange={(event) => updateField('textRotation', Number(event.target.value))}
            step={1}
            type="range"
            value={formState.textRotation}
          />
        </label>

        <div className="submit-form__message submit-form__message--success" role="status">
          <p>{PUBLIC_SUBMISSION_BETA_MESSAGE}</p>
          <p>Use this page to shape the slogan, switch blank boards, and rotate the text layer before public submissions reopen.</p>
        </div>

        <button className="site-cta" disabled type="button">
          Public submissions coming soon
        </button>
      </div>

      <aside className="submit-preview-panel">
        <div className="section-heading section-heading--compact">
          <p className="section-heading__eyebrow">Live preview</p>
          <h2 className="section-heading__title">See the board before submissions reopen</h2>
          <p className="section-heading__description">
            Current template: {selectedTemplate.label}. The preview updates as you type and rotate the lettering.
          </p>
        </div>

        <SignPreview
          slogan={formState.slogan}
          template={formState.selectedTemplate}
          textRotation={formState.textRotation}
        />
      </aside>
    </div>
  )
}
