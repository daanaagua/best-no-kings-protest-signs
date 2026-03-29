import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import RootLayout from '@/app/layout'

vi.mock('next/script', () => ({
  default: ({ children, ...props }: React.ScriptHTMLAttributes<HTMLScriptElement>) => (
    <script {...props}>{children}</script>
  ),
}))

vi.mock('@/src/components/layout/site-header', () => ({
  SiteHeader: () => <div>header</div>,
}))

vi.mock('@/src/components/layout/site-footer', () => ({
  SiteFooter: () => <div>footer</div>,
}))

describe('RootLayout', () => {
  it('injects the GA4 script and config for G-N6ES6BGB70', () => {
    const markup = renderToStaticMarkup(
      <RootLayout>
        <div>child</div>
      </RootLayout>,
    )

    expect(markup).toContain('https://www.googletagmanager.com/gtag/js?id=G-N6ES6BGB70')
    expect(markup).toContain("gtag('config', 'G-N6ES6BGB70')")
    expect(markup).toContain('child')
  })
})
