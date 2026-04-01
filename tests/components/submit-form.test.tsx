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
  it('exports the current board as a PNG', async () => {
    render(<SubmitForm />)

    fireEvent.change(screen.getByRole('textbox', { name: /Layer text/i }), {
      target: { value: 'Power to the Public' },
    })
    fireEvent.click(screen.getByRole('button', { name: /Export PNG/i }))

    await waitFor(() => {
      expect(exportPreviewAsPng).toHaveBeenCalledTimes(1)
    })

    const [element, filename] = exportPreviewAsPng.mock.calls[0]!

    expect(element).toBeInstanceOf(HTMLElement)
    expect(filename).toBe('power-to-the-public.png')
  })

  it('shows the blank white board in the template switcher and reinitializes the board when selected', () => {
    render(<SubmitForm />)

    fireEvent.click(screen.getByRole('radio', { name: /Blank white board/i }))

    expect(screen.getByRole('radio', { name: /Blank white board/i })).toBeChecked()
    expect(screen.getByText(/blank white board/i)).toBeInTheDocument()
  })

  it('adds a new text layer to the board', () => {
    render(<SubmitForm />)

    fireEvent.click(screen.getByRole('button', { name: /Add text/i }))

    expect(screen.getAllByText(/Text layer/i).length).toBeGreaterThan(0)
  })

  it('adds an uploaded image layer to the board', async () => {
    render(<SubmitForm />)

    const file = new File(['image'], 'poster.png', { type: 'image/png' })
    fireEvent.change(screen.getByLabelText(/Upload image/i), { target: { files: [file] } })

    await waitFor(() => {
      expect(screen.getAllByText(/poster\.png/i).length).toBeGreaterThan(0)
    })
  })

  it('updates board state when a selected layer is moved, rotated, and resized', () => {
    render(<SubmitForm />)

    fireEvent.pointerDown(screen.getByTestId('stage-layer-handle-move'))
    fireEvent.pointerMove(screen.getByTestId('sign-board-stage'), { clientX: 220, clientY: 240 })
    fireEvent.pointerUp(screen.getByTestId('sign-board-stage'))

    fireEvent.pointerDown(screen.getByTestId('stage-layer-handle-rotate'))
    fireEvent.pointerMove(screen.getByTestId('sign-board-stage'), { clientX: 260, clientY: 260 })
    fireEvent.pointerUp(screen.getByTestId('sign-board-stage'))

    fireEvent.pointerDown(screen.getByTestId('stage-layer-handle-resize'))
    fireEvent.pointerMove(screen.getByTestId('sign-board-stage'), { clientX: 360, clientY: 360 })
    fireEvent.pointerUp(screen.getByTestId('sign-board-stage'))

    expect(screen.getByDisplayValue('220')).toBeInTheDocument()
    expect(screen.getByLabelText(/Layer rotation/i)).toHaveValue(30)
    expect(screen.getByLabelText(/Layer width/i)).toHaveValue(360)
  })

  it('lets users inline-edit the selected text layer and toggle layer visibility', () => {
    render(<SubmitForm />)

    fireEvent.doubleClick(screen.getByText(/Your slogan preview/i))
    fireEvent.change(screen.getByRole('textbox', { name: /Layer text/i }), {
      target: { value: 'Town Hall Over Throne Room' },
    })
    fireEvent.click(screen.getByRole('button', { name: /Hide layer/i }))

    expect(screen.getByDisplayValue('Town Hall Over Throne Room')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Show layer/i })).toBeInTheDocument()
  })
})
