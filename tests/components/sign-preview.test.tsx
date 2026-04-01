import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { SignPreview } from '@/src/components/submit/sign-preview'

describe('SignPreview', () => {
  it('renders the provided slogan inside each supported template shell', () => {
    const templates = ['classic', 'tilted', 'bold-marker', 'printable'] as const

    for (const template of templates) {
      const { unmount } = render(
        <SignPreview slogan="No Crown for a Clown" template={template} textRotation={0} textOffsetY={0} textScale={1} textColor="#111111" />,
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
    const { container } = render(<SignPreview slogan={slogan} template="printable" textRotation={0} textOffsetY={0} textScale={1} textColor="#111111" />)
    const poster = container.querySelector('.sign-preview__poster')

    expect(poster).not.toBeNull()
    expect(within(poster as HTMLElement).getByText(/all/i)).toBeInTheDocument()
  })

  it('breaks long unbroken words into multiple poster lines', () => {
    const { container } = render(
      <SignPreview slogan="Pneumonoultramicroscopicsilicovolcanoconiosis" template="bold-marker" textRotation={0} textOffsetY={0} textScale={1} textColor="#111111" />,
    )
    const poster = container.querySelector('.sign-preview__poster')

    expect(poster).not.toBeNull()
    expect((poster as HTMLElement).querySelectorAll('.sign-preview__line')).toHaveLength(4)
  })

  it('keeps the preview shell free of decorative sticks and chrome', () => {
    const { container } = render(<SignPreview slogan="No Kings" template="classic" textRotation={0} textOffsetY={0} textScale={1} textColor="#111111" />)

    expect(container.querySelector('.sign-preview__stick')).toBeNull()
    expect(container.querySelector('.sign-preview__template-label')).toBeNull()
  })

  it('renders the text layer with arbitrary rotation over the board template', () => {
    const { container } = render(
      <SignPreview slogan="Power to the Public" template="classic" textRotation={-14} textOffsetY={0} textScale={1} textColor="#111111" />,
    )

    const textLayer = container.querySelector('.sign-preview__text-layer') as HTMLElement | null
    const poster = container.querySelector('.sign-preview__poster') as HTMLElement | null

    expect(textLayer).not.toBeNull()
    expect(textLayer?.style.getPropertyValue('--text-rotation')).toBe('-14deg')
    expect(poster?.style.backgroundImage).toContain('/submit-templates/')
  })

  it('applies custom text color, vertical offset, and scale to the text layer', () => {
    const { container } = render(
      <SignPreview
        slogan="Power to the Public"
        template="tilted"
        textRotation={8}
        textOffsetY={12}
        textScale={1.14}
        textColor="#b42318"
      />,
    )

    const textLayer = container.querySelector('.sign-preview__text-layer') as HTMLElement | null

    expect(textLayer).not.toBeNull()
    expect(textLayer?.style.getPropertyValue('--text-offset-y')).toBe('12px')
    expect(textLayer?.style.getPropertyValue('--text-scale')).toBe('1.14')
    expect(textLayer?.style.getPropertyValue('--text-color')).toBe('#b42318')
  })

  it('renders the shared board scene inside the legacy preview wrapper', () => {
    render(
      <SignPreview slogan="Power to the Public" template="classic" textRotation={0} textOffsetY={0} textScale={1} textColor="#111111" />,
    )

    expect(screen.getByTestId('sign-board-scene')).toBeInTheDocument()
  })
})
