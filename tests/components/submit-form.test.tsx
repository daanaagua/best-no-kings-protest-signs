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
})
