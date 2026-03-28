import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { SignDetailActions } from '@/src/components/signs/sign-detail-actions'

describe('SignDetailActions', () => {
  it('keeps vote and share behavior inside the client island', () => {
    render(
      <SignDetailActions
        shareUrl="https://bestnokingsprotestsigns.org/signs/no-crown-for-a-clown"
        signSlogan="Save the sequins for the circus"
        signTitle="No Crown for a Clown"
        voteCount={942}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: /Vote for this sign/i }))

    expect(screen.getByText('943 votes')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Vote recorded/i })).toBeDisabled()
    expect(screen.getByRole('link', { name: /Share this sign/i })).toHaveAttribute(
      'href',
      expect.stringContaining('https://twitter.com/intent/tweet'),
    )
  })
})
