import type { SignCategory, SignRecord } from '@/src/lib/signs/types'

export type SignPageMetadata = {
  title: string
  description: string
  keywords: string[]
}

function formatCategoryLabel(category: SignCategory) {
  return category.charAt(0).toUpperCase() + category.slice(1)
}

export function buildHomeMetadata(): SignPageMetadata {
  return {
    title: 'Best No Kings Protest Signs, Funny Ideas & Community Uploads',
    description:
      'Browse the best No Kings protest signs, funny sign ideas, printable slogans, and approved community designs. Static launch keeps public voting and new submissions in beta.',
    keywords: [
      'no kings protest signs',
      'best no kings protest signs',
      'protest sign ideas',
      'no kings sign ideas',
      'anti monarchy protest signs',
      'printable protest signs',
    ],
  }
}

export function buildCategoryMetadata(category: SignCategory): SignPageMetadata {
  return {
    title: `${formatCategoryLabel(category)} No Kings Protest Sign Ideas`,
    description: `Browse ${category} No Kings protest sign ideas, explore related printable picks, and preview where approved community signs fit into the static launch archive.`,
    keywords: [
      `${category} no kings protest sign ideas`,
      `${category} protest signs`,
      'no kings protest sign ideas',
      'protest poster ideas',
    ],
  }
}

export function buildTopMetadata(category: SignCategory): SignPageMetadata {
  return {
    title: `Top ${formatCategoryLabel(category)} No Kings Protest Signs`,
    description: `See the strongest ${category} No Kings protest signs ranked from launch scoring and editorial picks.`,
    keywords: [
      `top ${category} no kings protest signs`,
      `best ${category} protest signs`,
      'no kings protest signs',
      'ranked protest signs',
    ],
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
    keywords: [
      normalizedTitle,
      'no kings protest sign',
      'protest sign',
      'march sign ideas',
    ],
  }
}
