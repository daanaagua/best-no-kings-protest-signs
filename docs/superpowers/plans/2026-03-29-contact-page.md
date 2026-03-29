# Contact Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a minimal `/contact` page that embeds the user's Tally form and exposes the route in the site footer.

**Architecture:** Use a server-rendered App Router page for the route, keep the body mostly static, and embed the form through a plain Tally iframe configured to hide the hosted form title. Reuse existing global page shell styles and add only the smallest CSS needed for a clean, full-width embed panel.

**Tech Stack:** Next.js App Router, React Server Components, global CSS, Vitest, Testing Library

---

### Task 1: Add the failing contact page test

**Files:**
- Create: `tests/app/contact-page.test.tsx`
- Modify: `tests/components/site-header.test.tsx` only if existing shared mocks require it
- Test: `tests/app/contact-page.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import ContactPage, { metadata } from '@/app/contact/page'

describe('Contact page', () => {
  it('renders the tally iframe with hidden-title embed parameters', () => {
    render(<ContactPage />)

    const frame = screen.getByTitle(/contact form/i)

    expect(frame).toHaveAttribute(
      'src',
      expect.stringContaining('https://tally.so/embed/vG48ad'),
    )
    expect(frame).toHaveAttribute('src', expect.stringContaining('hideTitle=1'))
    expect(frame).toHaveAttribute('src', expect.stringContaining('transparentBackground=1'))
    expect(frame).toHaveAttribute('src', expect.stringContaining('dynamicHeight=1'))
  })

  it('publishes contact metadata', () => {
    expect(metadata.title).toMatch(/Contact/i)
    expect(metadata.alternates?.canonical).toBe('/contact')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:run -- tests/app/contact-page.test.tsx`
Expected: FAIL because `@/app/contact/page` does not exist yet.

- [ ] **Step 3: Write minimal implementation to satisfy the new test**

Create `app/contact/page.tsx` with:

```tsx
import type { Metadata } from 'next'

import { siteConfig } from '@/src/data/site'

const tallyEmbedUrl =
  'https://tally.so/embed/vG48ad?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1'

export const metadata: Metadata = {
  title: `Contact | ${siteConfig.name}`,
  description: 'Contact Best No Kings Protest Signs through the official Tally form.',
  alternates: {
    canonical: '/contact',
  },
}

export default function ContactPage() {
  return (
    <div className="contact-page">
      <section className="contact-page__panel">
        <iframe
          title="Contact form"
          src={tallyEmbedUrl}
          width="100%"
          height="560"
          frameBorder="0"
          marginHeight={0}
          marginWidth={0}
        />
      </section>
    </div>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:run -- tests/app/contact-page.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/contact/page.tsx tests/app/contact-page.test.tsx
git commit -m "feat: add embedded contact page"
```

### Task 2: Add footer discoverability and test it first

**Files:**
- Modify: `src/data/site.ts`
- Modify: `tests/components/site-header.test.tsx` only if shared nav assumptions break
- Create or Modify: `tests/components/site-footer.test.tsx`
- Test: `tests/components/site-footer.test.tsx`

- [ ] **Step 1: Write the failing footer test**

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { SiteFooter } from '@/src/components/layout/site-footer'

describe('SiteFooter', () => {
  it('includes a contact link', () => {
    render(<SiteFooter />)

    expect(screen.getByRole('link', { name: /contact/i })).toHaveAttribute('href', '/contact')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:run -- tests/components/site-footer.test.tsx`
Expected: FAIL because the footer config does not include `Contact` yet, or the test file does not exist yet.

- [ ] **Step 3: Add the minimal footer configuration change**

Update `src/data/site.ts` by appending the link in the most appropriate existing footer group:

```ts
{
  heading: 'Policies',
  links: [
    { label: 'Privacy Policy', href: '/privacy-policy' },
    { label: 'Terms', href: '/terms' },
    { label: 'Contact', href: '/contact' },
  ],
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:run -- tests/components/site-footer.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/data/site.ts tests/components/site-footer.test.tsx
git commit -m "feat: expose contact page in footer"
```

### Task 3: Add the minimal page styling and confirm the route works with the footer link

**Files:**
- Modify: `app/globals.css`
- Modify: `tests/app/contact-page.test.tsx`
- Test: `tests/app/contact-page.test.tsx`

- [ ] **Step 1: Extend the failing test with structural assertions**

```tsx
it('keeps the page visually minimal around the embed', () => {
  render(<ContactPage />)

  expect(screen.getByTitle(/contact form/i)).toBeInTheDocument()
  expect(document.querySelector('.contact-page')).not.toBeNull()
  expect(document.querySelector('.contact-page__panel')).not.toBeNull()
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:run -- tests/app/contact-page.test.tsx`
Expected: FAIL until the final class names and layout wrapper exist exactly as asserted.

- [ ] **Step 3: Add the minimal CSS for the new route**

Append focused styles to `app/globals.css` near the other page layouts:

```css
.contact-page {
  width: min(100%, 52rem);
  margin: 0 auto;
  padding-top: clamp(1.25rem, 2vw, 1.85rem);
}

.contact-page__panel {
  position: relative;
  margin-bottom: clamp(1.5rem, 3vw, 2.4rem);
  padding: clamp(0.85rem, 1.8vw, 1rem);
  border: 3px solid var(--ink);
  border-radius: 1.2rem 0.55rem 1.2rem 0.55rem;
  background: linear-gradient(180deg, rgba(255, 248, 238, 0.98), rgba(245, 233, 213, 0.92));
  box-shadow: var(--shadow-strong);
}

.contact-page__panel::before {
  content: '';
  position: absolute;
  inset: 0.55rem;
  border: 1px dashed rgba(22, 38, 53, 0.18);
  border-radius: 0.9rem 0.3rem 0.9rem 0.3rem;
  pointer-events: none;
}

.contact-page__panel iframe {
  position: relative;
  z-index: 1;
  display: block;
  min-height: 34rem;
  border: none;
}
```

- [ ] **Step 4: Run focused tests and one shared layout regression test**

Run: `npm run test:run -- tests/app/contact-page.test.tsx tests/components/site-footer.test.tsx tests/app/layout.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/globals.css tests/app/contact-page.test.tsx tests/components/site-footer.test.tsx
git commit -m "style: match contact embed to site shell"
```

### Task 4: Run final verification for the feature slice

**Files:**
- Verify only: `app/contact/page.tsx`
- Verify only: `src/data/site.ts`
- Verify only: `app/globals.css`
- Verify only: `tests/app/contact-page.test.tsx`
- Verify only: `tests/components/site-footer.test.tsx`

- [ ] **Step 1: Run the targeted test suite**

Run: `npm run test:run -- tests/app/contact-page.test.tsx tests/components/site-footer.test.tsx tests/app/layout.test.tsx`
Expected: PASS.

- [ ] **Step 2: Run the production build**

Run: `npm run build`
Expected: PASS with `/contact` included in the app build.

- [ ] **Step 3: Manually verify route shape in local dev if needed**

Run: `npm run dev`
Then open: `http://localhost:3000/contact`
Expected: the page loads with a minimal embed panel and no oversized hero copy.

- [ ] **Step 4: Commit**

```bash
git add app/contact/page.tsx src/data/site.ts app/globals.css tests/app/contact-page.test.tsx tests/components/site-footer.test.tsx
git commit -m "feat: add minimal contact route"
```
