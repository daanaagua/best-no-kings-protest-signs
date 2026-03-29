'use client'

import { useId, useMemo, useRef, useState } from 'react'

import {
  SIGN_TEMPLATE_IDS,
  TEXT_COLOR_OPTIONS,
  getSignTemplateDefinition,
  type SignTemplateId,
  type TextColorOptionId,
} from '@/src/lib/signs/templates'
import { SignPreview } from '@/src/components/submit/sign-preview'
import { PUBLIC_SUBMISSION_BETA_MESSAGE } from '@/src/lib/launch-mode'
import { buildExportFileName, exportPreviewAsPng } from '@/src/lib/signs/export-preview'
import {
  validateSubmission,
  type SubmissionValidationErrors,
} from '@/src/lib/submissions/validation'

type SubmissionFormState = {
  slogan: string
  selectedTemplate: SignTemplateId
  textRotation: number
  textOffsetY: number
  textScale: number
  submitterName: string
  submitterEmail: string
  acceptedPolicy: boolean
  confirmedOwnership: boolean
  selectedTextColor?: TextColorOptionId
}

type SubmitFormProps = {
  communityMvpEnabled?: boolean
}

const FIRST_TEMPLATE_ID = SIGN_TEMPLATE_IDS[0]
const FIRST_TEXT_COLOR_ID = TEXT_COLOR_OPTIONS[0].id
const ERROR_FIELD_ORDER = [
  'slogan',
  'selectedTemplate',
  'submitterEmail',
  'acceptedPolicy',
  'confirmedOwnership',
  'selectedTextColor',
  'textRotation',
  'textOffsetY',
  'textScale',
] as const satisfies ReadonlyArray<Exclude<keyof SubmissionValidationErrors, 'form'>>

const INITIAL_FORM_STATE: SubmissionFormState = {
  slogan: '',
  selectedTemplate: 'classic',
  textRotation: 0,
  textOffsetY: 0,
  textScale: 1,
  submitterName: '',
  submitterEmail: '',
  acceptedPolicy: false,
  confirmedOwnership: false,
}

export function SubmitForm({ communityMvpEnabled = false }: SubmitFormProps) {
  const [formState, setFormState] = useState<SubmissionFormState>(INITIAL_FORM_STATE)
  const [isExporting, setIsExporting] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitErrors, setSubmitErrors] = useState<SubmissionValidationErrors>({})
  const [submitStatus, setSubmitStatus] = useState<string | null>(null)
  const errorIdPrefix = useId()
  const previewExportRef = useRef<HTMLDivElement | null>(null)
  const sloganRef = useRef<HTMLTextAreaElement | null>(null)
  const templateRef = useRef<HTMLInputElement | null>(null)
  const emailRef = useRef<HTMLInputElement | null>(null)
  const acceptedPolicyRef = useRef<HTMLInputElement | null>(null)
  const confirmedOwnershipRef = useRef<HTMLInputElement | null>(null)
  const textColorRef = useRef<HTMLInputElement | null>(null)
  const textRotationRef = useRef<HTMLInputElement | null>(null)
  const textOffsetYRef = useRef<HTMLInputElement | null>(null)
  const textScaleRef = useRef<HTMLInputElement | null>(null)
  const selectedTemplate = useMemo(
    () => getSignTemplateDefinition(formState.selectedTemplate),
    [formState.selectedTemplate],
  )
  const selectedTextColor = useMemo(
    () => TEXT_COLOR_OPTIONS.find((option) => option.id === formState.selectedTextColor),
    [formState.selectedTextColor],
  )

  const emailHelperId = `${errorIdPrefix}-submitterEmail-helper`

  function getErrorId(field: keyof SubmissionValidationErrors) {
    return `${errorIdPrefix}-${field}-error`
  }

  function getDescribedBy(...ids: Array<string | undefined>) {
    const describedBy = ids.filter(Boolean).join(' ')

    return describedBy || undefined
  }

  function focusField(field: (typeof ERROR_FIELD_ORDER)[number]) {
    const focusTargets = {
      slogan: sloganRef,
      selectedTemplate: templateRef,
      submitterEmail: emailRef,
      acceptedPolicy: acceptedPolicyRef,
      confirmedOwnership: confirmedOwnershipRef,
      selectedTextColor: textColorRef,
      textRotation: textRotationRef,
      textOffsetY: textOffsetYRef,
      textScale: textScaleRef,
    }

    focusTargets[field].current?.focus()
  }

  function setErrorsAndFocus(errors: SubmissionValidationErrors) {
    setSubmitErrors(errors)

    const firstErrorField = ERROR_FIELD_ORDER.find((field) => errors[field])

    if (firstErrorField) {
      focusField(firstErrorField)
    }
  }

  function updateField<K extends keyof SubmissionFormState>(key: K, value: SubmissionFormState[K]) {
    setFormState((currentState) => ({
      ...currentState,
      [key]: value,
    }))
    setSubmitStatus(null)
    setSubmitErrors((currentErrors) => {
      if (!currentErrors[key] && !currentErrors.form) {
        return currentErrors
      }

      const nextErrors = { ...currentErrors }
      delete nextErrors[key]
      delete nextErrors.form

      return nextErrors
    })
  }

  async function handleExport() {
    if (!previewExportRef.current || isExporting) {
      return
    }

    try {
      setIsExporting(true)
      await exportPreviewAsPng(previewExportRef.current, buildExportFileName(formState.slogan))
    } finally {
      setIsExporting(false)
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const validation = validateSubmission(formState)

    if (!validation.success) {
      setErrorsAndFocus(validation.errors)
      setSubmitStatus(null)
      return
    }

    try {
      setIsSubmitting(true)
      setSubmitErrors({})
      setSubmitStatus(null)

      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formState),
      })
      const body = (await response.json().catch(() => null)) as
        | { message?: string; error?: string; errors?: SubmissionValidationErrors }
        | null

      if (!response.ok) {
        const nextErrors = {
          ...(body?.errors ?? {}),
          ...(body?.error ? { form: body.error } : {}),
        }

        setErrorsAndFocus(nextErrors)
        setSubmitStatus(null)

        return
      }

      setSubmitStatus(body?.message ?? 'Your sign is pending review.')
    } catch {
      setSubmitErrors({
        form: 'We could not send your sign right now. Please try again.',
      })
      setSubmitStatus(null)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="submit-layout">
      <form className="submit-form" noValidate onSubmit={handleSubmit}>
        <div className="section-heading section-heading--compact">
          <p className="section-heading__eyebrow">Build your sign</p>
          <h2 className="section-heading__title" id="submit-form-title">
            {communityMvpEnabled ? 'Shape the board, then submit it for review' : 'Shape the board, then export a PNG'}
          </h2>
          <p className="section-heading__description">
            {communityMvpEnabled
              ? 'Try slogans, switch templates, and use the live board preview to dial in a poster you can send for review or export locally.'
              : 'Try slogans, switch templates, and use the live board preview to dial in a poster you can carry, print, or share.'}
          </p>
        </div>

        <label className="submit-field">
          <span className="submit-field__label">Slogan</span>
          <textarea
            aria-describedby={submitErrors.slogan ? getErrorId('slogan') : undefined}
            aria-invalid={submitErrors.slogan ? 'true' : undefined}
            className="submit-field__input submit-field__input--textarea"
            name="slogan"
            onChange={(event) => updateField('slogan', event.target.value)}
            placeholder="No crowns. No thrones. Just voters."
            ref={sloganRef}
            rows={4}
            value={formState.slogan}
          />
          {submitErrors.slogan ? (
            <p id={getErrorId('slogan')} role="alert">
              {submitErrors.slogan}
            </p>
          ) : null}
        </label>

        <fieldset
          aria-describedby={submitErrors.selectedTemplate ? getErrorId('selectedTemplate') : undefined}
          className="submit-fieldset"
        >
          <legend className="submit-field__label">Template switcher</legend>
          <div className="template-switcher" role="list">
            {SIGN_TEMPLATE_IDS.map((templateId) => {
              const template = getSignTemplateDefinition(templateId)
              const isSelected = formState.selectedTemplate === templateId

                return (
                  <label key={templateId} className={`template-switcher__option ${isSelected ? 'template-switcher__option--selected' : ''}`} role="listitem">
                    <input
                      aria-describedby={submitErrors.selectedTemplate ? getErrorId('selectedTemplate') : undefined}
                      checked={isSelected}
                      name="selectedTemplate"
                      onChange={() => updateField('selectedTemplate', templateId)}
                      ref={templateId === FIRST_TEMPLATE_ID ? templateRef : undefined}
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
          {submitErrors.selectedTemplate ? (
            <p id={getErrorId('selectedTemplate')} role="alert">
              {submitErrors.selectedTemplate}
            </p>
          ) : null}
        </fieldset>

        {communityMvpEnabled ? (
          <>
            <label className="submit-field">
              <span className="submit-field__label">Your name</span>
              <input
                className="submit-field__input"
                name="submitterName"
                onChange={(event) => updateField('submitterName', event.target.value)}
                type="text"
                value={formState.submitterName}
              />
            </label>

            <label className="submit-field">
              <span className="submit-field__label">Email</span>
              <input
                aria-describedby={getDescribedBy(
                  emailHelperId,
                  submitErrors.submitterEmail ? getErrorId('submitterEmail') : undefined,
                )}
                aria-invalid={submitErrors.submitterEmail ? 'true' : undefined}
                className="submit-field__input"
                name="submitterEmail"
                onChange={(event) => updateField('submitterEmail', event.target.value)}
                ref={emailRef}
                type="email"
                value={formState.submitterEmail}
              />
              <p id={emailHelperId}>Optional. Not shown publicly.</p>
              {submitErrors.submitterEmail ? (
                <p id={getErrorId('submitterEmail')} role="alert">
                  {submitErrors.submitterEmail}
                </p>
              ) : null}
            </label>

            <label className="submit-field">
              <span className="submit-field__label">
                <input
                  aria-describedby={submitErrors.acceptedPolicy ? getErrorId('acceptedPolicy') : undefined}
                  aria-invalid={submitErrors.acceptedPolicy ? 'true' : undefined}
                  checked={formState.acceptedPolicy}
                  name="acceptedPolicy"
                  onChange={(event) => updateField('acceptedPolicy', event.target.checked)}
                  ref={acceptedPolicyRef}
                  type="checkbox"
                />{' '}
                I agree to the content policy for community submissions.
              </span>
              {submitErrors.acceptedPolicy ? (
                <p id={getErrorId('acceptedPolicy')} role="alert">
                  {submitErrors.acceptedPolicy}
                </p>
              ) : null}
            </label>

            <label className="submit-field">
              <span className="submit-field__label">
                <input
                  aria-describedby={submitErrors.confirmedOwnership ? getErrorId('confirmedOwnership') : undefined}
                  aria-invalid={submitErrors.confirmedOwnership ? 'true' : undefined}
                  checked={formState.confirmedOwnership}
                  name="confirmedOwnership"
                  onChange={(event) => updateField('confirmedOwnership', event.target.checked)}
                  ref={confirmedOwnershipRef}
                  type="checkbox"
                />{' '}
                I confirm ownership or safe-to-share rights for this slogan.
              </span>
              {submitErrors.confirmedOwnership ? (
                <p id={getErrorId('confirmedOwnership')} role="alert">
                  {submitErrors.confirmedOwnership}
                </p>
              ) : null}
            </label>

            <div className="submit-form__message submit-form__message--success" role="status">
              <p>Community submissions are live. Send your styled sign for moderator review while keeping the preview and export tools available.</p>
              {submitStatus ? <p>{submitStatus}</p> : <p>Use this page to tune the current board, then submit the exact styled sign you see in the preview.</p>}
            </div>

            {submitErrors.form ? <p role="alert">{submitErrors.form}</p> : null}

            <button className="site-cta" disabled={isSubmitting} type="submit">
              {isSubmitting ? 'Submitting for review...' : 'Submit styled sign for review'}
            </button>
          </>
        ) : (
          <div className="submit-form__message submit-form__message--success" role="status">
            <p>{PUBLIC_SUBMISSION_BETA_MESSAGE}</p>
            <p>Use this page to shape the slogan, switch blank boards, and fine-tune text color, angle, position, and size under the live preview.</p>
          </div>
        )}
      </form>

      <aside className="submit-preview-panel">
        <div className="section-heading section-heading--compact">
          <p className="section-heading__eyebrow">Live preview</p>
          <h2 className="section-heading__title">See the board before you export</h2>
          <p className="section-heading__description">
            Current template: {selectedTemplate.label}. The preview updates as you type, rotate the lettering, and adjust color, position, and size.
          </p>
        </div>

        <div className="submit-preview-export" ref={previewExportRef}>
          <SignPreview
            slogan={formState.slogan}
            template={formState.selectedTemplate}
            textRotation={formState.textRotation}
            textOffsetY={formState.textOffsetY}
            textScale={formState.textScale}
            textColor={selectedTextColor?.value ?? selectedTemplate.textColor}
          />
        </div>

        <div className="submit-preview-controls">
          <button className="site-cta submit-export-button" onClick={handleExport} type="button">
            {isExporting ? 'Exporting PNG...' : 'Export PNG'}
          </button>

          <fieldset
            aria-describedby={submitErrors.selectedTextColor ? getErrorId('selectedTextColor') : undefined}
            className="submit-fieldset"
          >
            <legend className="submit-field__label">Text color</legend>
            <div className="color-switcher" role="list">
              {TEXT_COLOR_OPTIONS.map((option) => {
                const isSelected = option.id === formState.selectedTextColor

                return (
                  <label
                    key={option.id}
                    className={`color-switcher__option ${isSelected ? 'color-switcher__option--selected' : ''}`}
                    role="listitem"
                  >
                    <input
                      aria-describedby={submitErrors.selectedTextColor ? getErrorId('selectedTextColor') : undefined}
                      checked={isSelected}
                      name="selectedTextColor"
                      onChange={() => updateField('selectedTextColor', option.id)}
                      ref={option.id === FIRST_TEXT_COLOR_ID ? textColorRef : undefined}
                      type="radio"
                      value={option.id}
                    />
                    <span aria-hidden="true" className="color-switcher__swatch" style={{ background: option.value }} />
                    <span className="color-switcher__label">{option.label}</span>
                  </label>
                )
              })}
            </div>
            {submitErrors.selectedTextColor ? (
              <p id={getErrorId('selectedTextColor')} role="alert">
                {submitErrors.selectedTextColor}
              </p>
            ) : null}
          </fieldset>

          <label className="submit-field">
            <span className="submit-field__label submit-field__label--row">
              <span>Text angle</span>
              <strong>{formState.textRotation}°</strong>
            </span>
            <input
              aria-describedby={submitErrors.textRotation ? getErrorId('textRotation') : undefined}
              aria-invalid={submitErrors.textRotation ? 'true' : undefined}
              aria-label="Text angle"
              className="submit-field__range"
              max={30}
              min={-30}
              name="textRotation"
              onChange={(event) => updateField('textRotation', Number(event.target.value))}
              ref={textRotationRef}
              step={1}
              type="range"
              value={formState.textRotation}
            />
            {submitErrors.textRotation ? (
              <p id={getErrorId('textRotation')} role="alert">
                {submitErrors.textRotation}
              </p>
            ) : null}
          </label>

          <label className="submit-field">
            <span className="submit-field__label submit-field__label--row">
              <span>Text position</span>
              <strong>{formState.textOffsetY}px</strong>
            </span>
            <input
              aria-describedby={submitErrors.textOffsetY ? getErrorId('textOffsetY') : undefined}
              aria-invalid={submitErrors.textOffsetY ? 'true' : undefined}
              aria-label="Text position"
              className="submit-field__range"
              max={32}
              min={-32}
              name="textOffsetY"
              onChange={(event) => updateField('textOffsetY', Number(event.target.value))}
              ref={textOffsetYRef}
              step={1}
              type="range"
              value={formState.textOffsetY}
            />
            {submitErrors.textOffsetY ? (
              <p id={getErrorId('textOffsetY')} role="alert">
                {submitErrors.textOffsetY}
              </p>
            ) : null}
          </label>

          <label className="submit-field">
            <span className="submit-field__label submit-field__label--row">
              <span>Text size</span>
              <strong>{Math.round(formState.textScale * 100)}%</strong>
            </span>
            <input
              aria-describedby={submitErrors.textScale ? getErrorId('textScale') : undefined}
              aria-invalid={submitErrors.textScale ? 'true' : undefined}
              aria-label="Text size"
              className="submit-field__range"
              max={120}
              min={80}
              name="textScale"
              onChange={(event) => updateField('textScale', Number(event.target.value) / 100)}
              ref={textScaleRef}
              step={1}
              type="range"
              value={Math.round(formState.textScale * 100)}
            />
            {submitErrors.textScale ? (
              <p id={getErrorId('textScale')} role="alert">
                {submitErrors.textScale}
              </p>
            ) : null}
          </label>
        </div>
      </aside>
    </div>
  )
}
