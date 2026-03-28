# Best No Kings Protest Signs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a distinctive Next.js App Router MVP for `BESTNOKINGSPROTESTSIGNS.ORG` with a branded homepage, No Kings category pages, top-list pages, sign detail pages, a moderated text-submission flow, and a custom logo.

**Architecture:** Use a static-first Next.js App Router site with structured editorial seed data, exact route-level metadata helpers, file-backed MVP persistence for submissions and vote counters, and small client islands for voting and submission preview. The public query layer must merge official signs and approved community signs so homepage, categories, top lists, and detail pages all read from one consistent content contract.

**Tech Stack:** Next.js App Router, TypeScript, React, Tailwind CSS, Vitest, Testing Library, ESLint, npm

---

## File Structure

- `package.json` - scripts and dependencies
- `tsconfig.json` - TypeScript config
- `next.config.ts` - Next.js config
- `postcss.config.mjs` - Tailwind/PostCSS config
- `vitest.config.ts` - Vitest config
- `.gitignore` - ignores build output and dependencies
- `app/layout.tsx` - global layout, metadata defaults, shell
- `app/globals.css` - theme, layout, typography, poster-style cards
- `app/page.tsx` - homepage targeting `best no kings protest signs`
- `app/topics/no-kings/[category]/page.tsx` - category pages
- `app/topics/no-kings/top/[category]/page.tsx` - top-list pages
- `app/signs/[slug]/page.tsx` - detail pages for official and approved community signs
- `app/submit/page.tsx` - text submission page
- `app/api/submissions/route.ts` - create pending submissions
- `app/api/votes/route.ts` - increment stored vote counters
- `app/internal/moderation/page.tsx` - protected lightweight moderation screen
- `app/about/page.tsx` - about page
- `app/content-policy/page.tsx` - moderation/content policy page
- `app/privacy-policy/page.tsx` - privacy policy page
- `app/terms/page.tsx` - terms page
- `app/not-found.tsx` - branded 404
- `src/data/signs.ts` - 48+ editorial launch sign records
- `src/data/sign-assets.ts` - image registry for editorial sign assets in `public/signs/`
- `src/data/site.ts` - nav labels, category descriptions, homepage copy
- `src/lib/signs/types.ts` - core types
- `src/lib/signs/queries.ts` - unified public content queries
- `src/lib/signs/ranking.ts` - editors picks, trending, top-all-time calculations
- `src/lib/signs/metadata.ts` - metadata builders
- `src/lib/signs/templates.ts` - deterministic text-template definitions for submit flow
- `src/lib/signs/votes.ts` - vote API helpers and local duplicate prevention keys
- `src/lib/submissions/validation.ts` - submission validation
- `src/lib/submissions/store.ts` - file-backed submission and vote store
- `src/components/brand/logo.tsx` - logo wordmark and mark
- `src/components/layout/site-header.tsx` - header/nav
- `src/components/layout/site-footer.tsx` - footer
- `src/components/home/hero.tsx` - homepage hero
- `src/components/home/category-rail.tsx` - homepage category entry cards
- `src/components/signs/sign-card.tsx` - reusable poster card
- `src/components/signs/sign-grid.tsx` - reusable section/grid block
- `src/components/signs/sign-detail.tsx` - detail-page render block with share and vote UI
- `src/components/signs/vote-button.tsx` - client vote control
- `src/components/submit/sign-preview.tsx` - deterministic preview for text submissions
- `src/components/submit/submit-form.tsx` - submission form UI
- `public/logo-mark.svg` - icon mark
- `public/logo-wordmark.svg` - wordmark asset
- `public/favicon.svg` - favicon source
- `public/signs/` - editorial sign images
- `data/submissions.json` - pending / approved / rejected text submissions
- `data/votes.json` - stored vote counts by slug
- `tests/setup.ts` - test setup
- `tests/lib/signs/queries.test.ts` - public query layer tests
- `tests/lib/signs/ranking.test.ts` - ranking tests
- `tests/lib/signs/metadata.test.ts` - metadata tests
- `tests/lib/submissions/validation.test.ts` - validation tests
- `tests/lib/submissions/store.test.ts` - submission store tests
- `tests/components/site-header.test.tsx` - brand shell render test
- `tests/components/sign-card.test.tsx` - sign card render test
- `tests/components/sign-preview.test.tsx` - preview render test
- `README.md` - local run + Cloudflare deployment notes

## Task 1: Scaffold the Next.js project and test tooling

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.ts`
- Create: `postcss.config.mjs`
- Create: `vitest.config.ts`
- Create: `.gitignore`
- Create: `app/layout.tsx`
- Create: `app/globals.css`
- Create: `tests/setup.ts`

- [ ] **Step 1: Scaffold the base app (configuration / generated-code exception to TDD)**

```bash
npm create next-app@latest . --ts --tailwind --eslint --app --use-npm --import-alias "@/*"
```

- [ ] **Step 2: Add test dependencies**

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom @vitejs/plugin-react
```

- [ ] **Step 3: Configure Vitest and test setup**

```ts
// tests/setup.ts
import '@testing-library/jest-dom'
```

Add `vitest.config.ts` with jsdom environment and alias support.

- [ ] **Step 4: Verify the toolchain runs**

```bash
npm run lint
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "chore: scaffold next app and test tooling"
```

## Task 2: Define the sign model, asset registry, public query layer, and ranking rules

**Files:**
- Create: `src/lib/signs/types.ts`
- Create: `src/lib/signs/queries.ts`
- Create: `src/lib/signs/ranking.ts`
- Create: `src/data/signs.ts`
- Create: `src/data/sign-assets.ts`
- Create: `tests/lib/signs/queries.test.ts`
- Create: `tests/lib/signs/ranking.test.ts`

- [ ] **Step 1: Write the failing query and ranking tests**

```ts
import { describe, expect, it } from 'vitest'
import { getApprovedHomepageCommunitySigns, getSignBySlug, getSignsByCategory } from '@/lib/signs/queries'
import { getEditorsPicks, getTopAllTimeSigns, getTrendingSigns } from '@/lib/signs/ranking'

describe('public sign queries', () => {
  it('returns a sign by slug', () => {
    expect(getSignBySlug('no-crown-for-a-clown')?.slug).toBe('no-crown-for-a-clown')
  })

  it('returns category matches using category tags', () => {
    expect(getSignsByCategory('funny').every((sign) => sign.categories.includes('funny'))).toBe(true)
  })

  it('returns approved community signs for the homepage feed', () => {
    expect(Array.isArray(getApprovedHomepageCommunitySigns(6))).toBe(true)
  })
})

describe('ranking helpers', () => {
  it('returns editors picks', () => {
    expect(getEditorsPicks(4)).toHaveLength(4)
  })

  it('returns top all-time signs sorted by voteCount', () => {
    const top = getTopAllTimeSigns('funny', 3)
    expect(top[0].voteCount).toBeGreaterThanOrEqual(top[1].voteCount)
  })

  it('returns trending signs using freshness and voteCount', () => {
    expect(getTrendingSigns('funny', 3)).toHaveLength(3)
  })
})
```

- [ ] **Step 2: Run the tests to verify they fail**

```bash
npx vitest run tests/lib/signs/queries.test.ts tests/lib/signs/ranking.test.ts
```

Expected: FAIL because the data and helper modules do not exist yet.

- [ ] **Step 3: Implement the minimal data contract and helpers**

```ts
export type SignCategory = 'funny' | 'best' | 'kids' | 'printable'

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
  sourceType: 'official' | 'community'
}
```

Implement:

- `getAllSigns()`
- `getSignBySlug(slug)`
- `getSignsByCategory(category)`
- `getApprovedHomepageCommunitySigns(limit)`
- `getEditorsPicks(limit)`
- `getTopAllTimeSigns(category, limit)`
- `getTrendingSigns(category, limit)`

Seed at least 48 editorial launch entries in `src/data/signs.ts`, with image paths mapped in `src/data/sign-assets.ts` under `public/signs/`, so each category page can launch with at least 12 cards.

At least 30 of those entries must ship with final, styled official sign images for the first public release. Do not treat temporary placeholders as complete launch assets.

- [ ] **Step 4: Produce the official launch sign assets**

Generate at least 30 final official sign images for launch using the agreed sign-board visual system and save them under `public/signs/`. Ensure `src/data/sign-assets.ts` references the final filenames.

- [ ] **Step 5: Run the tests to verify they pass**

```bash
npx vitest run tests/lib/signs/queries.test.ts tests/lib/signs/ranking.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/lib/signs/types.ts src/lib/signs/queries.ts src/lib/signs/ranking.ts src/data/signs.ts src/data/sign-assets.ts tests/lib/signs/queries.test.ts tests/lib/signs/ranking.test.ts
git commit -m "feat: add sign model and ranking layer"
```

## Task 3: Build exact metadata helpers for homepage, categories, top pages, and details

**Files:**
- Create: `src/lib/signs/metadata.ts`
- Create: `tests/lib/signs/metadata.test.ts`

- [ ] **Step 1: Write the failing metadata tests**

```ts
import { describe, expect, it } from 'vitest'
import { buildCategoryMetadata, buildHomeMetadata, buildSignMetadata, buildTopMetadata } from '@/lib/signs/metadata'

describe('metadata helpers', () => {
  it('builds the exact homepage title', () => {
    expect(buildHomeMetadata().title).toBe('Best No Kings Protest Signs, Funny Ideas & Community Uploads')
  })

  it('builds the exact category title', () => {
    expect(buildCategoryMetadata('funny').title).toBe('Funny No Kings Protest Sign Ideas')
  })

  it('keeps category and top-page titles distinct', () => {
    expect(buildCategoryMetadata('funny').title).not.toBe(buildTopMetadata('funny').title)
  })

  it('builds the exact sign detail title', () => {
    expect(buildSignMetadata({ title: 'No Crown for a Clown' } as any).title).toBe('No Crown for a Clown | No Kings Protest Sign')
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
npx vitest run tests/lib/signs/metadata.test.ts
```

Expected: FAIL because the metadata module does not exist.

- [ ] **Step 3: Implement metadata helpers**

Implement separate builders for home, category, top, and sign-detail pages using the exact patterns from the spec.

- [ ] **Step 4: Run the test to verify it passes**

```bash
npx vitest run tests/lib/signs/metadata.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/signs/metadata.ts tests/lib/signs/metadata.test.ts
git commit -m "feat: add metadata helpers"
```

## Task 4: Design the brand system, logo, and shared site shell

**Files:**
- Create: `src/data/site.ts`
- Create: `src/components/brand/logo.tsx`
- Create: `src/components/layout/site-header.tsx`
- Create: `src/components/layout/site-footer.tsx`
- Create: `tests/components/site-header.test.tsx`
- Modify: `app/layout.tsx`
- Modify: `app/globals.css`
- Create: `public/logo-mark.svg`
- Create: `public/logo-wordmark.svg`
- Create: `public/favicon.svg`

- [ ] **Step 1: Write the failing header render test**

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SiteHeader } from '@/components/layout/site-header'

describe('SiteHeader', () => {
  it('renders the site brand and primary links', () => {
    render(<SiteHeader />)
    expect(screen.getByText(/Best No Kings Protest Signs/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Submit a Sign/i })).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
npx vitest run tests/components/site-header.test.tsx
```

Expected: FAIL because the brand shell does not exist.

- [ ] **Step 3: Implement the brand shell and logo**

Create:

- a bold typographic logo
- a high-contrast civic palette
- a distinctive poster-like header
- a footer with trust and policy links

- [ ] **Step 4: Run the test to verify it passes**

```bash
npx vitest run tests/components/site-header.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/data/site.ts src/components/brand/logo.tsx src/components/layout/site-header.tsx src/components/layout/site-footer.tsx app/layout.tsx app/globals.css public/logo-mark.svg public/logo-wordmark.svg public/favicon.svg tests/components/site-header.test.tsx
git commit -m "feat: add logo and site shell"
```

## Task 5: Build the homepage and reusable sign-card system

**Files:**
- Create: `src/components/home/hero.tsx`
- Create: `src/components/home/category-rail.tsx`
- Create: `src/components/signs/sign-card.tsx`
- Create: `src/components/signs/sign-grid.tsx`
- Create: `tests/components/sign-card.test.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Write the failing SignCard render test**

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SignCard } from '@/components/signs/sign-card'

describe('SignCard', () => {
  it('renders title, category, vote count, and link', () => {
    render(
      <SignCard
        sign={{
          slug: 'no-crown-for-a-clown',
          title: 'No Crown for a Clown',
          slogan: 'No Crown for a Clown',
          primaryCategory: 'funny',
          categories: ['funny', 'best'],
          image: '/poster.jpg',
          description: 'Sharp and memorable.',
          createdAt: '2026-03-28',
          voteCount: 82,
          sourceType: 'official',
        }}
      />,
    )

    expect(screen.getByText('No Crown for a Clown')).toBeInTheDocument()
    expect(screen.getByText(/funny/i)).toBeInTheDocument()
    expect(screen.getByText(/82/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
npx vitest run tests/components/sign-card.test.tsx
```

Expected: FAIL because `SignCard` does not exist.

- [ ] **Step 3: Implement homepage sections and reusable card UI**

Build the homepage with:

- hero
- editorial picks
- category rail
- trending section
- community section fed from approved community items
- SEO copy block

- [ ] **Step 4: Run the test to verify it passes**

```bash
npx vitest run tests/components/sign-card.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/home/hero.tsx src/components/home/category-rail.tsx src/components/signs/sign-card.tsx src/components/signs/sign-grid.tsx app/page.tsx tests/components/sign-card.test.tsx
git commit -m "feat: build homepage and sign card system"
```

## Task 6: Build category, top-list, and sign-detail routes

**Files:**
- Create: `app/topics/no-kings/[category]/page.tsx`
- Create: `app/topics/no-kings/top/[category]/page.tsx`
- Create: `app/signs/[slug]/page.tsx`
- Create: `src/components/signs/sign-detail.tsx`
- Create: `tests/lib/signs/related-signs.test.ts`
- Modify: `src/lib/signs/queries.ts`
- Modify: `src/lib/signs/ranking.ts`

- [ ] **Step 1: Write the failing related-signs test**

```ts
import { describe, expect, it } from 'vitest'
import { getRelatedSigns } from '@/lib/signs/queries'

describe('related sign queries', () => {
  it('returns same-category items excluding the current sign', () => {
    const related = getRelatedSigns('no-crown-for-a-clown', 'funny', 3)
    expect(related).toHaveLength(3)
    expect(related.some((sign) => sign.slug === 'no-crown-for-a-clown')).toBe(false)
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
npx vitest run tests/lib/signs/related-signs.test.ts
```

Expected: FAIL because `getRelatedSigns` does not exist.

- [ ] **Step 3: Implement the route pages and detail UI**

Add:

- category pages with unique intro copy, related category links, and FAQ content
- top pages that clearly differ from category pages and use ranking data
- sign detail pages for official and approved community items
- vote UI on the detail page
- share action on the detail page
- `getRelatedSigns()` helper

- [ ] **Step 4: Run the tests to verify they pass**

```bash
npx vitest run tests/lib/signs/related-signs.test.ts tests/lib/signs/metadata.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/topics/no-kings/[category]/page.tsx app/topics/no-kings/top/[category]/page.tsx app/signs/[slug]/page.tsx src/components/signs/sign-detail.tsx src/lib/signs/queries.ts src/lib/signs/ranking.ts tests/lib/signs/related-signs.test.ts
git commit -m "feat: add topic routes and sign detail pages"
```

## Task 7: Build submission persistence, moderation flow, vote API, and preview UI

**Files:**
- Create: `src/lib/signs/templates.ts`
- Create: `src/lib/signs/votes.ts`
- Create: `src/lib/submissions/validation.ts`
- Create: `src/lib/submissions/store.ts`
- Create: `src/components/signs/vote-button.tsx`
- Create: `src/components/submit/sign-preview.tsx`
- Create: `src/components/submit/submit-form.tsx`
- Create: `app/submit/page.tsx`
- Create: `app/api/submissions/route.ts`
- Create: `app/api/votes/route.ts`
- Create: `app/internal/moderation/page.tsx`
- Create: `data/submissions.json`
- Create: `data/votes.json`
- Create: `tests/lib/submissions/validation.test.ts`
- Create: `tests/lib/submissions/store.test.ts`
- Create: `tests/components/sign-preview.test.tsx`
- Modify: `app/page.tsx`
- Modify: `app/signs/[slug]/page.tsx`
- Modify: `src/lib/signs/queries.ts`

- [ ] **Step 1: Write the failing validation test**

```ts
import { describe, expect, it } from 'vitest'
import { validateSubmission } from '@/lib/submissions/validation'

describe('submission validation', () => {
  it('rejects empty slogans', () => {
    expect(validateSubmission({ slogan: '', template: 'classic', acceptedPolicy: true, confirmedOwnership: true }).success).toBe(false)
  })

  it('requires policy and ownership confirmations', () => {
    expect(validateSubmission({ slogan: 'No Crown for a Clown', template: 'classic', acceptedPolicy: false, confirmedOwnership: true }).success).toBe(false)
  })
})
```

- [ ] **Step 2: Write the failing store test**

```ts
import { describe, expect, it } from 'vitest'
import { approveSubmission, createPendingSubmission, listApprovedSubmissions, rejectSubmission } from '@/lib/submissions/store'

describe('submission store', () => {
  it('creates pending submissions and can approve them', async () => {
    const pending = await createPendingSubmission({ slogan: 'No Crown for a Clown', template: 'classic', submitterName: 'Dana', submitterEmail: 'dana@example.com' })
    expect(pending.status).toBe('pending')
    expect(pending.slugCandidate).toBe('no-crown-for-a-clown')
    expect(typeof pending.createdAt).toBe('string')
    expect(pending.submitterEmail).toBe('dana@example.com')

    const approved = await approveSubmission(pending.id)
    expect(approved.status).toBe('approved')

    const approvedItems = await listApprovedSubmissions()
    expect(approvedItems.some((item) => item.id === pending.id)).toBe(true)
  })

  it('can reject pending submissions', async () => {
    const pending = await createPendingSubmission({ slogan: 'Reject me', template: 'classic' })
    const rejected = await rejectSubmission(pending.id, 'duplicate')
    expect(rejected.status).toBe('rejected')
    expect(rejected.moderatorNote).toBe('duplicate')
  })
})
```

- [ ] **Step 3: Write the failing preview render test**

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SignPreview } from '@/components/submit/sign-preview'

describe('SignPreview', () => {
  it('renders the provided slogan into the selected template shell', () => {
    render(<SignPreview slogan="No Crown for a Clown" template="classic" />)
    expect(screen.getByText('No Crown for a Clown')).toBeInTheDocument()
  })
})
```

- [ ] **Step 4: Run the tests to verify they fail**

```bash
npx vitest run tests/lib/submissions/validation.test.ts tests/lib/submissions/store.test.ts tests/components/sign-preview.test.tsx
```

Expected: FAIL because the submission modules do not exist.

- [ ] **Step 5: Implement validation, storage, and endpoints**

Build:

- deterministic sign templates with all 4 MVP styles: `classic`, `tilted`, `bold-marker`, `printable`
- file-backed `pending | approved | rejected` submission storage in `data/submissions.json`
- file-backed vote counters in `data/votes.json`
- `POST /api/submissions` for pending submissions
- `POST /api/votes` that increments server-side vote counts
- a lightweight protected moderation route using `MODERATION_TOKEN`

- [ ] **Step 6: Implement submit-page UI and public-content integration**

Build:

- live preview
- template switcher
- policy and ownership checkboxes
- clear pending-review confirmation
- vote button that calls the vote API and prevents duplicate votes per browser
- homepage community module reading approved submissions
- sign detail route resolving approved community signs as well as editorial signs

The submission record contract must explicitly include:

- `id`
- `slogan`
- `slugCandidate`
- `selectedTemplate`
- `submitterName?`
- `submitterEmail?`
- `status`
- `createdAt`
- `moderatorNote?`

- [ ] **Step 7: Run the tests to verify they pass**

```bash
npx vitest run tests/lib/submissions/validation.test.ts tests/lib/submissions/store.test.ts tests/components/sign-preview.test.tsx
```

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src/lib/signs/templates.ts src/lib/signs/votes.ts src/lib/submissions/validation.ts src/lib/submissions/store.ts src/components/signs/vote-button.tsx src/components/submit/sign-preview.tsx src/components/submit/submit-form.tsx app/submit/page.tsx app/api/submissions/route.ts app/api/votes/route.ts app/internal/moderation/page.tsx data/submissions.json data/votes.json tests/lib/submissions/validation.test.ts tests/lib/submissions/store.test.ts tests/components/sign-preview.test.tsx app/page.tsx app/signs/[slug]/page.tsx src/lib/signs/queries.ts
git commit -m "feat: add moderated submissions and vote persistence"
```

## Task 8: Add trust pages, README, and final verification

**Files:**
- Create: `app/about/page.tsx`
- Create: `app/content-policy/page.tsx`
- Create: `app/privacy-policy/page.tsx`
- Create: `app/terms/page.tsx`
- Create: `app/not-found.tsx`
- Create: `README.md`

- [ ] **Step 1: Add trust and policy pages**

Each page should be concise but complete enough for launch and AdSense trust requirements.

- [ ] **Step 2: Add README with local run and Cloudflare deployment notes**

Document:

- install and run
- lint and test commands
- build command
- where to update seed sign data and official sign assets
- where approved submissions and vote data are stored in MVP
- how to set `MODERATION_TOKEN`
- that the registered domain is `BESTNOKINGSPROTESTSIGNS.ORG`
- a simple Cloudflare deployment path

- [ ] **Step 3: Run the full unit test suite**

```bash
npx vitest run
```

Expected: PASS.

- [ ] **Step 4: Run lint**

```bash
npm run lint
```

Expected: PASS.

- [ ] **Step 5: Run the production build**

```bash
npm run build
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add app/about/page.tsx app/content-policy/page.tsx app/privacy-policy/page.tsx app/terms/page.tsx app/not-found.tsx README.md
git commit -m "docs: add launch policies and deployment notes"
```
