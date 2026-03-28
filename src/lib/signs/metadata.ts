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
      'Browse the best No Kings protest signs, funny sign ideas, printable slogans, and community-submitted designs. Vote on favorites or submit your own sign.',
  }
}

export function buildCategoryMetadata(category: SignCategory): SignPageMetadata {
  return {
    title: `${formatCategoryLabel(category)} No Kings Protest Sign Ideas`,
    description: `Browse ${category} No Kings protest sign ideas, vote on favorites, and discover related printable and community-created signs.`,
  }
}

export function buildTopMetadata(category: SignCategory): SignPageMetadata {
  return {
    title: `Top ${formatCategoryLabel(category)} No Kings Protest Signs`,
    description: `See the most popular ${category} No Kings protest signs ranked by votes and editorial picks.`,
  }
}

export function buildSignMetadata(
  sign: Pick<SignRecord, 'title'>,
): SignPageMetadata {
  return {
    title: `${sign.title} | No Kings Protest Sign`,
    description:
      'View this No Kings protest sign, vote on it, and explore related funny, printable, or community-submitted signs.',
  }
}
