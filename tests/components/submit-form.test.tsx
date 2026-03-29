import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { SubmitForm } from '@/src/components/submit/submit-form'

describe('SubmitForm', () => {
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
})
