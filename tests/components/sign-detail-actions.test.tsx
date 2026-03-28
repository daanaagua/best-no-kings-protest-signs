import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { SignDetailActions } from '@/src/components/signs/sign-detail-actions'

describe('SignDetailActions', () => {
  it('beta-gates public voting during the static launch', () => {
    render(
      <SignDetailActions
        shareUrl="https://bestnokingsprotestsigns.org/signs/no-crown-for-a-clown"
        signSlogan="Save the sequins for the circus"
        signTitle="No Crown for a Clown"
        voteCount={942}
      />,
    )

    expect(screen.getByText('942 votes')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Public voting opens after launch/i })).toBeDisabled()
    expect(screen.getByRole('status')).toHaveTextContent(/public voting is disabled/i)
    expect(screen.getByRole('link', { name: /Share this sign/i })).toHaveAttribute(
      'href',
      expect.stringContaining('https://twitter.com/intent/tweet'),
    )
  })
})
