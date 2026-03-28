import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { VoteButton } from '@/src/components/signs/vote-button'

describe('VoteButton', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('does not call the live vote API during the static launch', async () => {
    const fetchMock = vi.fn()
    const user = userEvent.setup()

    vi.stubGlobal('fetch', fetchMock)

    render(<VoteButton initialVoteCount={942} slug="no-crown-for-a-clown" />)

    const button = screen.getByRole('button', { name: /Public voting opens after launch/i })

    expect(button).toBeDisabled()
    await user.click(button)

    expect(fetchMock).not.toHaveBeenCalled()
    expect(screen.getByRole('status')).toHaveTextContent(/public voting is disabled/i)
    expect(screen.getByText('942 votes')).toBeInTheDocument()
  })
})
