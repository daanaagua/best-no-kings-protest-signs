import type { MetadataRoute } from 'next'

import { siteConfig } from '@/src/data/site'
import { getAllSigns } from '@/src/lib/signs/queries'
import { SIGN_CATEGORIES } from '@/src/lib/signs/types'
import { STATIC_LAUNCH_LAST_MODIFIED } from '@/src/lib/launch-mode'

function buildUrl(path: string) {
  return `${siteConfig.url}${path}`
}

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: buildUrl('/'),
      lastModified: STATIC_LAUNCH_LAST_MODIFIED,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: buildUrl('/about'),
      lastModified: STATIC_LAUNCH_LAST_MODIFIED,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: buildUrl('/content-policy'),
      lastModified: STATIC_LAUNCH_LAST_MODIFIED,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: buildUrl('/privacy-policy'),
      lastModified: STATIC_LAUNCH_LAST_MODIFIED,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: buildUrl('/terms'),
      lastModified: STATIC_LAUNCH_LAST_MODIFIED,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: buildUrl('/submit'),
      lastModified: STATIC_LAUNCH_LAST_MODIFIED,
      changeFrequency: 'weekly',
      priority: 0.6,
    },
  ]

  const categoryPages = SIGN_CATEGORIES.flatMap<MetadataRoute.Sitemap[number]>((category) => [
    {
      url: buildUrl(`/topics/no-kings/${category}`),
      lastModified: STATIC_LAUNCH_LAST_MODIFIED,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: buildUrl(`/topics/no-kings/top/${category}`),
      lastModified: STATIC_LAUNCH_LAST_MODIFIED,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ])

  const signPages = getAllSigns().map<MetadataRoute.Sitemap[number]>((sign) => ({
    url: buildUrl(`/signs/${sign.slug}`),
    lastModified: sign.createdAt,
    changeFrequency: 'weekly',
    priority: sign.sourceType === 'official' ? 0.7 : 0.6,
  }))

  return [...staticPages, ...categoryPages, ...signPages]
}
