/* eslint-disable @next/next/no-img-element */

import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { SignCard } from '@/src/components/signs/sign-card'
import { officialLaunchSigns } from '@/src/data/signs'

vi.mock('next/image', () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => <img {...props} alt={props.alt} />,
}))

describe('SignCard', () => {
  it('renders the sign title, metadata, and destination link', () => {
    const sign = officialLaunchSigns[0]

    render(<SignCard sign={sign} />)

    const image = screen.getByRole('img', { name: sign.title })

    expect(screen.getByRole('heading', { name: sign.title })).toBeInTheDocument()
    expect(screen.getByText(sign.slogan)).toBeInTheDocument()
    expect(screen.getByText('942 votes')).toBeInTheDocument()
    expect(image).toHaveAttribute('src', sign.image)
    expect(image).toHaveStyle({ objectFit: 'contain' })
    expect(screen.getByRole('link', { name: /View sign/i })).toHaveAttribute(
      'href',
      `/signs/${sign.slug}`,
    )
    expect(screen.queryByText('Editors pick')).not.toBeInTheDocument()
    expect(screen.queryByText('Funny')).not.toBeInTheDocument()
  })

  it('formats a singular vote count label', () => {
    const sign = {
      ...officialLaunchSigns[0],
      slug: 'single-vote-sign',
      title: 'Single Vote Sign',
      voteCount: 1,
    }

    render(<SignCard sign={sign} />)

    expect(screen.getByText('1 vote')).toBeInTheDocument()
    expect(screen.queryByText('1 votes')).not.toBeInTheDocument()
  })
})
