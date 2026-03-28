import type { SignCategory, SignRecord } from '@/src/lib/signs/types'

export type SignPageMetadata = {
  title: string
  description: string
}

function formatCategoryLabel(category: SignCategory) {
  return category.charAt(0).toUpperCase() + category.slice(1)
}

export function buildHomeMetadata(): SignPageMetadata {
  return {
    title: 'Best No Kings Protest Signs, Funny Ideas & Community Uploads',
    description:
      'Browse the best No Kings protest signs, funny sign ideas, printable slogans, and approved community designs. Static launch keeps public voting and new submissions in beta.',
  }
}

export function buildCategoryMetadata(category: SignCategory): SignPageMetadata {
  return {
    title: `${formatCategoryLabel(category)} No Kings Protest Sign Ideas`,
    description: `Browse ${category} No Kings protest sign ideas, explore related printable picks, and preview where approved community signs fit into the static launch archive.`,
  }
}

export function buildTopMetadata(category: SignCategory): SignPageMetadata {
  return {
    title: `Top ${formatCategoryLabel(category)} No Kings Protest Signs`,
    description: `See the strongest ${category} No Kings protest signs ranked from launch scoring and editorial picks.`,
  }
}

export function buildSignMetadata(
  sign: Pick<SignRecord, 'title'>,
): SignPageMetadata {
  const normalizedTitle = sign.title.trim()

  return {
    title: `${normalizedTitle} | No Kings Protest Sign`,
    description:
      'View this No Kings protest sign, share it, and explore related funny, printable, or approved community signs.',
  }
}
