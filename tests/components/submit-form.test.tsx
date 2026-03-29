import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

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
