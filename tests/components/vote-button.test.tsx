import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { VoteButton } from '@/src/components/signs/vote-button'

describe('VoteButton', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('keeps archived vote totals read-only without calling the live vote API', async () => {
    const fetchMock = vi.fn()
    const user = userEvent.setup()

    vi.stubGlobal('fetch', fetchMock)

    render(<VoteButton initialVoteCount={942} slug="no-crown-for-a-clown" />)

    const button = screen.getByRole('button', { name: /Public voting opens after launch/i })

    expect(button).toBeDisabled()
    await user.click(button)

    expect(fetchMock).not.toHaveBeenCalled()
    expect(screen.getByRole('status')).toHaveTextContent(/vote totals update from the curated archive/i)
    expect(screen.getByText('942 votes')).toBeInTheDocument()
  })
})
