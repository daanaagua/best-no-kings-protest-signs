import { render, screen } from '@testing-library/react'
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

      unmount()
    }
  })
})
