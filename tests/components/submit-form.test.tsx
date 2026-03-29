import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { SubmitForm } from '@/src/components/submit/submit-form'

type ExportPreviewAsPng = typeof import('@/src/lib/signs/export-preview')['exportPreviewAsPng']

const exportPreviewAsPng = vi.fn<ExportPreviewAsPng>().mockResolvedValue(undefined)

vi.mock('@/src/lib/signs/export-preview', () => ({
  buildExportFileName: (slogan: string) =>
    `${slogan
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'no-kings-sign'}.png`,
  exportPreviewAsPng: (...args: Parameters<ExportPreviewAsPng>) => exportPreviewAsPng(...args),
}))

afterEach(() => {
  exportPreviewAsPng.mockClear()
  vi.unstubAllGlobals()
})

describe('SubmitForm', () => {
  it('exports the current preview as a PNG', async () => {
    render(<SubmitForm />)

    fireEvent.change(screen.getByRole('textbox', { name: /Slogan/i }), {
      target: { value: 'Power to the Public' },
    })

    fireEvent.click(screen.getByRole('button', { name: /Export PNG/i }))

    await waitFor(() => {
      expect(exportPreviewAsPng).toHaveBeenCalledTimes(1)
    })

    const firstCall = exportPreviewAsPng.mock.calls[0]

    expect(firstCall).toBeDefined()

    const [element, filename] = firstCall!

    expect(element).toBeInstanceOf(HTMLElement)
    expect(filename).toBe('power-to-the-public.png')
  })

  it('lets people rotate preview text with a range control', () => {
    render(<SubmitForm />)

    const slider = screen.getByLabelText(/Text angle/i)
    fireEvent.change(slider, { target: { value: '18' } })

    expect(screen.getByText('18°')).toBeInTheDocument()
  })

  it('lets people change text color, vertical position, and text size', () => {
    render(<SubmitForm />)

    fireEvent.click(screen.getByRole('radio', { name: /Signal red/i }))
    fireEvent.change(screen.getByLabelText(/Text position/i), { target: { value: '12' } })
    fireEvent.change(screen.getByLabelText(/Text size/i), { target: { value: '114' } })

    expect(screen.getByText('12px')).toBeInTheDocument()
    expect(screen.getByText('114%')).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /Signal red/i })).toBeChecked()
  })

  it('shows the optional email privacy note and submits the styled sign for review', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          message: 'Your sign is pending review.',
          submission: {
            id: 'submission-1',
            status: 'pending',
            slogan: 'Power to the Public',
          },
        }),
        {
          status: 201,
          headers: {
            'Content-Type': 'application/json',
          },
        },
      ),
    )
    vi.stubGlobal('fetch', fetchMock)

    render(<SubmitForm communityMvpEnabled />)

    expect(screen.getByText(/optional.*not shown publicly/i)).toBeInTheDocument()

    fireEvent.change(screen.getByRole('textbox', { name: /Slogan/i }), {
      target: { value: 'Power to the Public' },
    })
    fireEvent.click(screen.getByRole('radio', { name: /Poster wall board/i }))
    fireEvent.click(screen.getByRole('radio', { name: /Signal red/i }))
    fireEvent.change(screen.getByLabelText(/Text angle/i), { target: { value: '18' } })
    fireEvent.change(screen.getByLabelText(/Text position/i), { target: { value: '12' } })
    fireEvent.change(screen.getByLabelText(/Text size/i), { target: { value: '114' } })
    fireEvent.change(screen.getByRole('textbox', { name: /Your name/i }), {
      target: { value: 'Dana Rivers' },
    })
    fireEvent.change(screen.getByRole('textbox', { name: /Email/i }), {
      target: { value: 'dana@example.com' },
    })
    fireEvent.click(screen.getByRole('checkbox', { name: /content policy/i }))
    fireEvent.click(screen.getByRole('checkbox', { name: /confirm ownership/i }))
    fireEvent.click(screen.getByRole('button', { name: /Submit styled sign for review/i }))

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1)
    })

    const [url, request] = fetchMock.mock.calls[0]!

    expect(url).toBe('/api/submissions')
    expect(request).toMatchObject({
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    expect(JSON.parse(String(request.body))).toMatchObject({
      slogan: 'Power to the Public',
      selectedTemplate: 'printable',
      submitterName: 'Dana Rivers',
      submitterEmail: 'dana@example.com',
      selectedTextColor: 'signal-red',
      textRotation: 18,
      textOffsetY: 12,
      textScale: 1.14,
      acceptedPolicy: true,
      confirmedOwnership: true,
    })
    expect(await screen.findByText(/pending review/i)).toBeInTheDocument()
  })

  it('shows inline field errors before sending a review submission', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    const { container } = render(<SubmitForm communityMvpEnabled />)

    expect(container.querySelector('form')).toHaveAttribute('novalidate')

    fireEvent.click(screen.getByRole('button', { name: /Submit styled sign for review/i }))

    const slogan = screen.getByRole('textbox', { name: /Slogan/i })
    const sloganError = await screen.findByText(/enter a slogan before sending your sign for review/i)
    const sloganErrorId = slogan.getAttribute('aria-describedby')

    expect(slogan).toHaveFocus()
    expect(slogan).toHaveAttribute('aria-invalid', 'true')
    expect(sloganErrorId).toBeTruthy()
    expect(document.getElementById(String(sloganErrorId))).toBe(sloganError)

    const acceptedPolicy = screen.getByRole('checkbox', { name: /content policy/i })
    const acceptedPolicyErrorId = acceptedPolicy.getAttribute('aria-describedby')

    expect(acceptedPolicy).toHaveAttribute('aria-invalid', 'true')
    expect(acceptedPolicyErrorId).toBeTruthy()
    expect(document.getElementById(String(acceptedPolicyErrorId))).toHaveTextContent(/accept the content policy/i)

    const confirmedOwnership = screen.getByRole('checkbox', { name: /confirm ownership/i })
    const confirmedOwnershipErrorId = confirmedOwnership.getAttribute('aria-describedby')

    expect(confirmedOwnership).toHaveAttribute('aria-invalid', 'true')
    expect(confirmedOwnershipErrorId).toBeTruthy()
    expect(document.getElementById(String(confirmedOwnershipErrorId))).toHaveTextContent(
      /moderators know the slogan is yours or safe to share/i,
    )
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('disables native email validation and shows the inline email error on submit', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    const { container } = render(<SubmitForm communityMvpEnabled />)

    expect(container.querySelector('form')).toHaveAttribute('novalidate')

    fireEvent.change(screen.getByRole('textbox', { name: /Slogan/i }), {
      target: { value: 'Power to the Public' },
    })
    fireEvent.change(screen.getByRole('textbox', { name: /Email/i }), {
      target: { value: 'not-an-email' },
    })
    fireEvent.click(screen.getByRole('checkbox', { name: /content policy/i }))
    fireEvent.click(screen.getByRole('checkbox', { name: /confirm ownership/i }))
    fireEvent.click(screen.getByRole('button', { name: /Submit styled sign for review/i }))

    const email = screen.getByRole('textbox', { name: /Email/i })
    const emailDescribedBy = email.getAttribute('aria-describedby')
    const emailDescriptionIds = (emailDescribedBy ?? '').split(/\s+/).filter(Boolean)

    expect(await screen.findByText(/enter a valid email address or leave the field blank/i)).toBeInTheDocument()
    expect(email).toHaveFocus()
    expect(email).toHaveAttribute('aria-invalid', 'true')
    expect(emailDescriptionIds).toHaveLength(2)
    expect(emailDescriptionIds.some((id) => document.getElementById(id)?.textContent?.match(/optional\. not shown publicly/i))).toBe(true)
    expect(emailDescriptionIds.some((id) => document.getElementById(id)?.textContent?.match(/valid email address/i))).toBe(true)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('announces server template errors on the template field and focuses the first invalid field', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          error: 'Fix the highlighted fields and try again.',
          errors: {
            selectedTemplate: 'Choose one of the four supported sign templates.',
          },
        }),
        {
          status: 422,
          headers: {
            'Content-Type': 'application/json',
          },
        },
      ),
    )
    vi.stubGlobal('fetch', fetchMock)

    render(<SubmitForm communityMvpEnabled />)

    fireEvent.change(screen.getByRole('textbox', { name: /Slogan/i }), {
      target: { value: 'Power to the Public' },
    })
    fireEvent.click(screen.getByRole('checkbox', { name: /content policy/i }))
    fireEvent.click(screen.getByRole('checkbox', { name: /confirm ownership/i }))
    fireEvent.click(screen.getByRole('button', { name: /Submit styled sign for review/i }))

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1)
    })

    const templateGroup = screen.getByRole('group', { name: /Template switcher/i })
    const templateErrorId = templateGroup.getAttribute('aria-describedby')
    const firstTemplate = screen.getByRole('radio', { name: /Centered crowd board/i })

    expect(templateErrorId).toBeTruthy()
    expect(document.getElementById(String(templateErrorId))).toHaveTextContent(/supported sign templates/i)
    expect(firstTemplate).toHaveAttribute('aria-describedby', String(templateErrorId))
    expect(firstTemplate).toHaveFocus()
  })

  it('shows inline style control errors returned by the server', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          error: 'Fix the highlighted fields and try again.',
          errors: {
            selectedTextColor: 'Choose a supported text color before submitting.',
            textRotation: 'Keep text angle between -30 and 30 degrees.',
            textOffsetY: 'Keep text position between -32 and 32 pixels.',
            textScale: 'Keep text size between 0.8 and 1.2.',
          },
        }),
        {
          status: 422,
          headers: {
            'Content-Type': 'application/json',
          },
        },
      ),
    )
    vi.stubGlobal('fetch', fetchMock)

    render(<SubmitForm communityMvpEnabled />)

    fireEvent.change(screen.getByRole('textbox', { name: /Slogan/i }), {
      target: { value: 'Power to the Public' },
    })
    fireEvent.change(screen.getByRole('textbox', { name: /Your name/i }), {
      target: { value: 'Dana Rivers' },
    })
    fireEvent.click(screen.getByRole('checkbox', { name: /content policy/i }))
    fireEvent.click(screen.getByRole('checkbox', { name: /confirm ownership/i }))
    fireEvent.click(screen.getByRole('button', { name: /Submit styled sign for review/i }))

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1)
    })

    const textColorGroup = screen.getByRole('group', { name: /Text color/i })
    const textColorErrorId = textColorGroup.getAttribute('aria-describedby')

    expect(textColorErrorId).toBeTruthy()
    expect(document.getElementById(String(textColorErrorId))).toHaveTextContent(/supported text color/i)

    const textAngle = screen.getByLabelText(/Text angle/i)
    const textAngleErrorId = textAngle.getAttribute('aria-describedby')

    expect(textAngleErrorId).toBeTruthy()
    expect(document.getElementById(String(textAngleErrorId))).toHaveTextContent(/between -30 and 30 degrees/i)

    const textPosition = screen.getByLabelText(/Text position/i)
    const textPositionErrorId = textPosition.getAttribute('aria-describedby')

    expect(textPositionErrorId).toBeTruthy()
    expect(document.getElementById(String(textPositionErrorId))).toHaveTextContent(/between -32 and 32 pixels/i)

    const textSize = screen.getByLabelText(/Text size/i)
    const textSizeErrorId = textSize.getAttribute('aria-describedby')

    expect(textSizeErrorId).toBeTruthy()
    expect(document.getElementById(String(textSizeErrorId))).toHaveTextContent(/between 0\.8 and 1\.2/i)
  })

  it('uses the current template default text color before a user picks a color', () => {
    const { container } = render(<SubmitForm />)
    const textLayer = container.querySelector('.sign-preview__text-layer') as HTMLElement | null

    expect(textLayer).not.toBeNull()
    expect(textLayer?.style.getPropertyValue('--text-color')).toBe('#162635')
    expect(screen.getByRole('radio', { name: /Signal red/i })).not.toBeChecked()
  })

  it('updates the preview color when the template changes and no explicit color was selected', () => {
    const { container } = render(<SubmitForm />)

    fireEvent.click(screen.getByRole('radio', { name: /Poster wall board/i }))

    const textLayer = container.querySelector('.sign-preview__text-layer') as HTMLElement | null

    expect(textLayer).not.toBeNull()
    expect(textLayer?.style.getPropertyValue('--text-color')).toBe('#111111')
    expect(screen.getByRole('radio', { name: /Signal red/i })).not.toBeChecked()
  })

  it('places text controls below the live preview so adjustments stay in view', () => {
    const { container } = render(<SubmitForm />)

    const previewRoot = container.querySelector('[data-testid="sign-preview-root"]')
    const angleSlider = screen.getByLabelText(/Text angle/i)

    expect(previewRoot).not.toBeNull()

    if (!previewRoot) {
      throw new Error('Expected sign preview root to render')
    }

    expect(previewRoot.compareDocumentPosition(angleSlider) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })
})
