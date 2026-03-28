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

    expect(screen.getByRole('heading', { name: sign.title })).toBeInTheDocument()
    expect(screen.getByText(sign.slogan)).toBeInTheDocument()
    expect(screen.getByText('Funny')).toBeInTheDocument()
    expect(screen.getByText('Editors pick')).toBeInTheDocument()
    expect(screen.getByText('942 votes')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: sign.title })).toHaveAttribute('src', sign.image)
    expect(screen.getByRole('link', { name: /View sign/i })).toHaveAttribute(
      'href',
      `/signs/${sign.slug}`,
    )
  })
})
