import { describe, expect, it } from 'vitest'

import robots from '@/app/robots'
import sitemap from '@/app/sitemap'

describe('SEO metadata files', () => {
  it('generates robots rules for the launch domain', () => {
    expect(robots()).toMatchObject({
      host: 'https://bestnokingsprotestsigns.org',
      sitemap: 'https://bestnokingsprotestsigns.org/sitemap.xml',
      rules: {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/internal/'],
      },
    })
  })

  it('includes core content routes and sign details in the sitemap', () => {
    const entries = sitemap()
    const urls = entries.map((entry) => entry.url)

    expect(urls).toContain('https://bestnokingsprotestsigns.org/')
    expect(urls).toContain('https://bestnokingsprotestsigns.org/submit')
    expect(urls).toContain('https://bestnokingsprotestsigns.org/topics/no-kings/funny')
    expect(urls).toContain('https://bestnokingsprotestsigns.org/topics/no-kings/top/funny')
    expect(urls).toContain('https://bestnokingsprotestsigns.org/signs/no-crown-for-a-clown')
    expect(urls.some((url) => url.includes('/internal/moderation'))).toBe(false)
  })
})
