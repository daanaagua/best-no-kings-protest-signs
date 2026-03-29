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
    title: 'Best No Kings Protest Signs for Marches, Rallies, and Printouts',
    description:
      'Find the best No Kings protest signs for marches, rallies, printouts, and community uploads, with one homepage that surfaces the strongest slogans first.',
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
    title: `${formatCategoryLabel(category)} No Kings Sign Ideas for Rally Posters`,
    description: `Browse ${category} No Kings sign ideas for rally posters, compare printable picks, and move back to the homepage hub for the full sign wall.`,
    keywords: [
      `${category} no kings sign ideas`,
      `${category} protest sign ideas`,
      'no kings protest sign ideas',
      'protest poster ideas',
    ],
  }
}

export function buildTopMetadata(category: SignCategory): SignPageMetadata {
  return {
    title: `Top ${formatCategoryLabel(category)} No Kings Signs for Fast Printing`,
    description: `See the strongest ${category} No Kings signs ranked for fast printing, then return to the homepage for the broader archive.`,
    keywords: [
      `top ${category} no kings signs`,
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
      'View this No Kings protest sign, download it as a PNG, share it, and explore related readable, printable, or approved community signs.',
    keywords: [
      normalizedTitle,
      'no kings protest sign',
      'protest sign',
      'march sign ideas',
    ],
  }
}
