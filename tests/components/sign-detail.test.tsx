/* eslint-disable @next/next/no-img-element */

import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { SignDetail } from '@/src/components/signs/sign-detail'
import { approvedCommunitySigns, officialLaunchSigns } from '@/src/data/signs'

vi.mock('next/image', () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => <img {...props} alt={props.alt} />,
}))

describe('SignDetail', () => {
  it('renders the static sign detail content with download and share actions', () => {
    render(
      <SignDetail
        shareUrl="https://bestnokingsprotestsigns.org/signs/no-crown-for-a-clown"
        sign={officialLaunchSigns[0]}
      />,
    )

    const image = screen.getByRole('img', { name: officialLaunchSigns[0].title })

    expect(image).toBeInTheDocument()
    expect(image).toHaveStyle({ objectFit: 'contain' })
    expect(screen.getByText('NO KINGS PROTEST SIGNS')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: officialLaunchSigns[0].title })).toBeInTheDocument()
    expect(
      screen.getByText(/launch-ready No Kings protest sign designed for marches, neighborhood rallies, and printable share-outs/i),
    ).toBeInTheDocument()
    expect(screen.getByText('942 votes')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Download PNG/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Share this sign/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Public voting opens after launch/i })).not.toBeInTheDocument()
    expect(screen.queryByText(/beta/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/funny/i)).not.toBeInTheDocument()
    expect(screen.queryByText('Editors pick')).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Funny' })).not.toBeInTheDocument()
  })

  it('renders approved community signs without reintroducing noisy category badges', () => {
    render(
      <SignDetail
        shareUrl="https://bestnokingsprotestsigns.org/signs/community-library-cards-over-crowns"
        sign={approvedCommunitySigns[0]}
      />,
    )

    expect(screen.getByRole('heading', { name: approvedCommunitySigns[0].title })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Download PNG/i })).toBeInTheDocument()
    expect(screen.queryByText(/beta/i)).not.toBeInTheDocument()
    expect(screen.queryByText('Community')).not.toBeInTheDocument()
  })
})
