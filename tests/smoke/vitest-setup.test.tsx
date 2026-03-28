import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

function SmokeTestComponent() {
  return <button type="button">Test toolchain ready</button>
}

describe('Vitest smoke test', () => {
  it('renders DOM content with Testing Library matchers', () => {
    render(<SmokeTestComponent />)

    expect(
      screen.getByRole('button', { name: 'Test toolchain ready' }),
    ).toBeInTheDocument()
  })
})
