import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { SubmitForm } from '@/src/components/submit/submit-form'

describe('SubmitForm', () => {
  it('keeps the submit route in preview-only beta mode', () => {
    render(<SubmitForm />)

    fireEvent.change(screen.getByRole('textbox', { name: /^Slogan$/i }), {
      target: { value: 'No crowns. No thrones. Just voters.' },
    })

    expect(
      screen.getByRole('heading', { name: /Preview your sign while public submissions are in beta/i }),
    ).toBeInTheDocument()
    expect(
      within(screen.getByTestId('sign-preview-root')).getByText('No crowns. No thrones. Just voters.'),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Public submissions coming soon/i })).toBeDisabled()
    expect(screen.getByRole('status')).toHaveTextContent(/preview-only/i)
  })
})
