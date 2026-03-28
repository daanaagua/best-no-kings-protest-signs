export const SIGN_CATEGORIES = ['funny', 'best', 'kids', 'printable'] as const

export type SignCategory = (typeof SIGN_CATEGORIES)[number]

export const SIGN_SOURCE_TYPES = ['official', 'community'] as const

export type SignSourceType = (typeof SIGN_SOURCE_TYPES)[number]

export type SignRecord = {
  topic: string
  slug: string
  title: string
  slogan: string
  primaryCategory: SignCategory
  categories: SignCategory[]
  image: string
  description: string
  createdAt: string
  voteCount: number
  editorsPick?: boolean
  sourceType: SignSourceType
}
