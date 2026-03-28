/* eslint-disable @next/next/no-img-element */

import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { SignDetail } from '@/src/components/signs/sign-detail'
import { approvedCommunitySigns, officialLaunchSigns } from '@/src/data/signs'

vi.mock('next/image', () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => <img {...props} alt={props.alt} />,
}))

describe('SignDetail', () => {
  it('increments the visible vote count after one vote and exposes a share action', () => {
    render(
      <SignDetail
        shareUrl="https://bestnokingsprotestsigns.org/signs/no-crown-for-a-clown/"
        sign={officialLaunchSigns[0]}
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

  it('renders approved community signs with the community source label', () => {
    render(
      <SignDetail
        shareUrl="https://bestnokingsprotestsigns.org/signs/community-library-cards-over-crowns/"
        sign={approvedCommunitySigns[0]}
      />,
    )

    expect(screen.getByText('Community')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: approvedCommunitySigns[0].title })).toBeInTheDocument()
  })
})
