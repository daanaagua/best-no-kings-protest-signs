import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { SignPreview } from '@/src/components/submit/sign-preview'

describe('SignPreview', () => {
  it('renders the provided slogan inside each supported template shell', () => {
    const templates = ['classic', 'tilted', 'bold-marker', 'printable'] as const

    for (const template of templates) {
      const { unmount } = render(
        <SignPreview slogan="No Crown for a Clown" template={template} />,
      )

      expect(screen.getByText('No Crown for a Clown')).toBeInTheDocument()
      expect(screen.getByTestId('sign-preview-root')).toHaveAttribute('data-template', template)
      expect(screen.queryByText(/Classic chant board|Tilted curbside sign|Bold marker block|Printable flyer layout/i)).not.toBeInTheDocument()
      expect(screen.getByText('NO KINGS PROTEST SIGNS')).toBeInTheDocument()

      unmount()
    }
  })

  it('keeps the final word visible inside the poster for longer slogans', () => {
    const slogan = 'We choose neighbors over crowns because every block deserves a vote from all'
    const { container } = render(<SignPreview slogan={slogan} template="printable" />)
    const poster = container.querySelector('.sign-preview__poster')

    expect(poster).not.toBeNull()
    expect(within(poster as HTMLElement).getByText(/all/i)).toBeInTheDocument()
  })

  it('breaks long unbroken words into multiple poster lines', () => {
    const { container } = render(
      <SignPreview slogan="Pneumonoultramicroscopicsilicovolcanoconiosis" template="bold-marker" />,
    )
    const poster = container.querySelector('.sign-preview__poster')

    expect(poster).not.toBeNull()
    expect((poster as HTMLElement).querySelectorAll('.sign-preview__line')).toHaveLength(4)
  })

  it('keeps the preview shell free of decorative sticks and chrome', () => {
    const { container } = render(<SignPreview slogan="No Kings" template="classic" />)

    expect(container.querySelector('.sign-preview__stick')).toBeNull()
    expect(container.querySelector('.sign-preview__template-label')).toBeNull()
  })
})
