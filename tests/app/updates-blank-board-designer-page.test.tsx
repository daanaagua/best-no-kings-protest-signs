import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import * as UpdatePageModule from '@/app/updates/blank-board-designer/page'

const UpdatePage = UpdatePageModule.default

describe('Blank board update page', () => {
  it('renders the sign maker update page with the submit CTA', () => {
    render(<UpdatePage />)

    expect(
      screen.getByRole('heading', { name: /The sign maker now starts on a blank board/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/ratio presets, image uploads, and free text placement/i),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Open the sign maker/i })).toHaveAttribute('href', '/submit')
  })

  it('renders distinct editorial sections for the update page', () => {
    render(<UpdatePage />)

    expect(screen.getByText(/What changed/i)).toBeInTheDocument()
    expect(screen.getByText(/Why we rebuilt it/i)).toBeInTheDocument()
    expect(screen.getByText(/What you can do now/i)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Take the new blank board for a spin/i })).toBeInTheDocument()
  })
})
