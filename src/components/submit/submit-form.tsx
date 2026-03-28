'use client'

import { useMemo, useState, type FormEvent } from 'react'

import {
  SIGN_TEMPLATE_IDS,
  getSignTemplateDefinition,
  type SignTemplateId,
} from '@/src/lib/signs/templates'
import { SignPreview } from '@/src/components/submit/sign-preview'

type SubmissionFormState = {
  slogan: string
  selectedTemplate: SignTemplateId
  submitterName: string
  submitterEmail: string
  acceptedPolicy: boolean
  confirmedOwnership: boolean
}

type SubmissionApiSuccess = {
  submission: {
    id: string
    slugCandidate: string
    status: string
  }
}

const INITIAL_FORM_STATE: SubmissionFormState = {
  slogan: '',
  selectedTemplate: 'classic',
  submitterName: '',
  submitterEmail: '',
  acceptedPolicy: false,
  confirmedOwnership: false,
}

export function SubmitForm() {
  const [formState, setFormState] = useState<SubmissionFormState>(INITIAL_FORM_STATE)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [confirmation, setConfirmation] = useState<SubmissionApiSuccess['submission'] | null>(null)
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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setFieldErrors({})

    try {
      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formState),
      })

      const payload = (await response.json()) as
        | (SubmissionApiSuccess & { errors?: Record<string, string> })
        | { error?: string; errors?: Record<string, string> }

      if (!response.ok || !('submission' in payload)) {
        setConfirmation(null)
        setFieldErrors(
          payload.errors ?? {
            form:
              'error' in payload && typeof payload.error === 'string'
                ? payload.error
                : 'Unable to send your sign right now.',
          },
        )
        return
      }

      setConfirmation(payload.submission)
      setFormState(INITIAL_FORM_STATE)
    } catch {
      setConfirmation(null)
      setFieldErrors({ form: 'Network hiccup. Please try your submission again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="submit-layout">
      <form className="submit-form" onSubmit={handleSubmit}>
        <div className="section-heading section-heading--compact">
          <p className="section-heading__eyebrow">Community submission</p>
          <h2 className="section-heading__title" id="submit-form-title">
            Draft a No Kings sign and send it to moderation
          </h2>
          <p className="section-heading__description">
            Pick a template, keep the slogan readable, and confirm policy plus ownership before you submit.
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
          {fieldErrors.slogan ? <span className="submit-field__error">{fieldErrors.slogan}</span> : null}
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
                  <span className="template-switcher__title">{template.label}</span>
                  <span className="template-switcher__description">{template.description}</span>
                </label>
              )
            })}
          </div>
          {fieldErrors.selectedTemplate ? (
            <span className="submit-field__error">{fieldErrors.selectedTemplate}</span>
          ) : null}
        </fieldset>

        <div className="submit-form__grid">
          <label className="submit-field">
            <span className="submit-field__label">Your name (optional)</span>
            <input
              className="submit-field__input"
              name="submitterName"
              onChange={(event) => updateField('submitterName', event.target.value)}
              type="text"
              value={formState.submitterName}
            />
          </label>

          <label className="submit-field">
            <span className="submit-field__label">Email (optional)</span>
            <input
              className="submit-field__input"
              name="submitterEmail"
              onChange={(event) => updateField('submitterEmail', event.target.value)}
              type="email"
              value={formState.submitterEmail}
            />
            {fieldErrors.submitterEmail ? (
              <span className="submit-field__error">{fieldErrors.submitterEmail}</span>
            ) : null}
          </label>
        </div>

        <label className="submit-check">
          <input
            checked={formState.acceptedPolicy}
            onChange={(event) => updateField('acceptedPolicy', event.target.checked)}
            type="checkbox"
          />
          <span>I accept the content policy and understand that every sign starts in pending review.</span>
        </label>
        {fieldErrors.acceptedPolicy ? (
          <span className="submit-field__error">{fieldErrors.acceptedPolicy}</span>
        ) : null}

        <label className="submit-check">
          <input
            checked={formState.confirmedOwnership}
            onChange={(event) => updateField('confirmedOwnership', event.target.checked)}
            type="checkbox"
          />
          <span>I own this slogan or have the right to share it for public review.</span>
        </label>
        {fieldErrors.confirmedOwnership ? (
          <span className="submit-field__error">{fieldErrors.confirmedOwnership}</span>
        ) : null}

        {fieldErrors.form ? <p className="submit-form__message submit-form__message--error">{fieldErrors.form}</p> : null}

        {confirmation ? (
          <div className="submit-form__message submit-form__message--success" role="status">
            <p>
              Submission saved. It is now <strong>pending review</strong> and queued under `{confirmation.slugCandidate}`.
            </p>
            <p>Moderators can approve, reject, or leave a note before it appears in the public community wall.</p>
          </div>
        ) : null}

        <button className="site-cta" disabled={isSubmitting} type="submit">
          {isSubmitting ? 'Sending to moderation...' : 'Submit for review'}
        </button>
      </form>

      <aside className="submit-preview-panel">
        <div className="section-heading section-heading--compact">
          <p className="section-heading__eyebrow">Live preview</p>
          <h2 className="section-heading__title">See the board before you send it</h2>
          <p className="section-heading__description">
            Current template: {selectedTemplate.label}. The preview updates as you type.
          </p>
        </div>

        <SignPreview slogan={formState.slogan} template={formState.selectedTemplate} />
      </aside>
    </div>
  )
}
