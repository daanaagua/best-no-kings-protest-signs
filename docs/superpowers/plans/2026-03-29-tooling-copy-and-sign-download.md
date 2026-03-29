# Tooling Copy And Sign Download Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove public beta-style copy from the public site, reposition `/submit` as a usable sign-maker tool, and add a `Download PNG` action for every sign detail page.

**Architecture:** Keep backend write restrictions untouched, but rewrite public UX copy across route content and metadata so the product feels live. Add a dedicated client-side sign-asset PNG exporter for detail pages, separate from the existing preview exporter used on `/submit`, and wire it into the sign detail action bar.

**Tech Stack:** Next.js App Router, React Server Components, React client components, TypeScript, Vitest, Testing Library, browser canvas/image APIs

---

### Task 1: Replace public beta-copy expectations with failing tests first

**Files:**
- Modify: `tests/app/home-page.test.tsx`
- Modify: `tests/app/submit-page.test.tsx`
- Modify: `tests/components/sign-detail.test.tsx`
- Modify: `tests/lib/signs/metadata.test.ts`
- Modify: `tests/app/not-found.test.tsx` if it already exists, otherwise create it
- Test: `tests/app/home-page.test.tsx`
- Test: `tests/app/submit-page.test.tsx`
- Test: `tests/components/sign-detail.test.tsx`
- Test: `tests/lib/signs/metadata.test.ts`

- [ ] **Step 1: Write the failing copy tests**

Add assertions that the old phrases are gone and the new productized language is present. Examples:

```tsx
expect(screen.queryByText(/beta/i)).not.toBeInTheDocument()
expect(screen.getByText(/make your sign/i)).toBeInTheDocument()
expect(screen.getByText(/download png/i)).toBeInTheDocument()
```

For metadata tests, assert the updated descriptions no longer mention `static launch`, `preview-only`, or `beta`.

- [ ] **Step 2: Run the focused tests to verify they fail**

Run: `npm run test:run -- tests/app/home-page.test.tsx tests/app/submit-page.test.tsx tests/components/sign-detail.test.tsx tests/lib/signs/metadata.test.ts`
Expected: FAIL because the current copy still uses beta-oriented messaging and detail pages do not expose `Download PNG`.

- [ ] **Step 3: Write the minimal copy updates to satisfy those tests**

Update the public-facing copy in these files:

- `src/data/site.ts`
- `src/lib/signs/metadata.ts`
- `app/page.tsx`
- `app/submit/page.tsx`
- `src/components/submit/submit-form.tsx`
- `app/signs/[slug]/page.tsx`
- `src/components/signs/sign-detail.tsx`
- `app/not-found.tsx`
- `app/llms.txt/route.ts`
- `app/llms-full.txt/route.ts`

Use direct “browse / build / export / share” wording, not “preview-only / coming soon / beta” wording.

- [ ] **Step 4: Re-run the focused tests to verify they pass**

Run: `npm run test:run -- tests/app/home-page.test.tsx tests/app/submit-page.test.tsx tests/components/sign-detail.test.tsx tests/lib/signs/metadata.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/data/site.ts src/lib/signs/metadata.ts app/page.tsx app/submit/page.tsx src/components/submit/submit-form.tsx app/signs/[slug]/page.tsx src/components/signs/sign-detail.tsx app/not-found.tsx app/llms.txt/route.ts app/llms-full.txt/route.ts tests/app/home-page.test.tsx tests/app/submit-page.test.tsx tests/components/sign-detail.test.tsx tests/lib/signs/metadata.test.ts
git commit -m "copy: present public routes as live tools"
```

### Task 2: Add a failing PNG-download test for sign detail pages

**Files:**
- Modify: `tests/components/sign-detail.test.tsx`
- Create: `tests/components/download-sign-button.test.tsx`
- Test: `tests/components/sign-detail.test.tsx`
- Test: `tests/components/download-sign-button.test.tsx`

- [ ] **Step 1: Write the failing tests**

Add one detail-page assertion that a `Download PNG` control is rendered, and one component-level test for the button/export flow. Example shape:

```tsx
expect(screen.getByRole('button', { name: /download png/i })).toBeInTheDocument()
```

For the client button test, mock the export helper and verify it receives the current sign title and image asset path.

- [ ] **Step 2: Run the focused tests to verify they fail**

Run: `npm run test:run -- tests/components/sign-detail.test.tsx tests/components/download-sign-button.test.tsx`
Expected: FAIL because the download button component does not exist yet.

- [ ] **Step 3: Add the minimal UI implementation**

Create a new client component such as `src/components/signs/download-sign-button.tsx` and wire it into `src/components/signs/sign-detail.tsx` so the action area includes:

- vote count badge
- `Download PNG` button
- `Share this sign` link

Remove the visible disabled-voting CTA from the detail-page experience.

- [ ] **Step 4: Re-run the focused tests to verify they pass**

Run: `npm run test:run -- tests/components/sign-detail.test.tsx tests/components/download-sign-button.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/signs/sign-detail.tsx src/components/signs/download-sign-button.tsx tests/components/sign-detail.test.tsx tests/components/download-sign-button.test.tsx
git commit -m "feat: add sign detail png download action"
```

### Task 3: Build the sign-asset PNG export path with TDD

**Files:**
- Create: `src/lib/signs/export-sign-asset.ts`
- Create: `tests/lib/signs/export-sign-asset.test.ts`
- Modify: `src/components/signs/download-sign-button.tsx`
- Test: `tests/lib/signs/export-sign-asset.test.ts`

- [ ] **Step 1: Write the failing export utility tests**

Cover these behaviors:

- exported file names end with `.png`
- image loading paths support `.png` and `.svg`
- the helper draws to canvas and triggers a download link

Mock `Image`, `document.createElement('canvas')`, `canvas.toDataURL`, and the download anchor as needed.

- [ ] **Step 2: Run the utility test to verify it fails**

Run: `npm run test:run -- tests/lib/signs/export-sign-asset.test.ts`
Expected: FAIL because the utility file does not exist yet.

- [ ] **Step 3: Write the minimal export implementation**

Implement a utility that:

- accepts `assetUrl` and `title`
- resolves the asset to an image source
- draws it onto a canvas sized to the loaded asset
- exports `canvas.toDataURL('image/png')`
- downloads using the same sanitized filename convention used by the submit exporter, or a shared helper extracted from `src/lib/signs/export-preview.ts`

Keep the helper small and browser-only.

- [ ] **Step 4: Re-run the utility test to verify it passes**

Run: `npm run test:run -- tests/lib/signs/export-sign-asset.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/signs/export-sign-asset.ts src/components/signs/download-sign-button.tsx src/lib/signs/export-preview.ts tests/lib/signs/export-sign-asset.test.ts
git commit -m "feat: export sign assets as png"
```

### Task 4: Update submit-route language so it reads like a live tool

**Files:**
- Modify: `app/submit/page.tsx`
- Modify: `src/components/submit/submit-form.tsx`
- Modify: `tests/app/submit-page.test.tsx`
- Test: `tests/app/submit-page.test.tsx`

- [ ] **Step 1: Extend the failing submit-page tests**

Assert that `/submit` now describes a live sign builder and export workflow, not a deferred public-submission reopening flow.

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm run test:run -- tests/app/submit-page.test.tsx`
Expected: FAIL until the submit route copy is updated.

- [ ] **Step 3: Write the minimal copy and CTA updates**

Update submit copy to describe current capabilities plainly:

- type a slogan
- switch board templates
- adjust color, size, angle, and position
- export PNG now

Do not imply live server-side submission is already open.

- [ ] **Step 4: Re-run the submit-page test to verify it passes**

Run: `npm run test:run -- tests/app/submit-page.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/submit/page.tsx src/components/submit/submit-form.tsx tests/app/submit-page.test.tsx
git commit -m "copy: position submit route as sign builder"
```

### Task 5: Refresh public machine-readable and fallback route copy

**Files:**
- Modify: `app/llms.txt/route.ts`
- Modify: `app/llms-full.txt/route.ts`
- Modify: `app/not-found.tsx`
- Modify: `tests/app/not-found.test.tsx` if present, otherwise create it
- Test: `tests/app/not-found.test.tsx`

- [ ] **Step 1: Write the failing assertions**

Assert that the not-found page and llms route text no longer frame the site as a beta launch experience.

- [ ] **Step 2: Run the relevant tests to verify they fail**

Run: `npm run test:run -- tests/app/not-found.test.tsx`
Expected: FAIL until the old copy is removed.

- [ ] **Step 3: Update the fallback and machine-readable copy**

Describe the site as a live archive plus sign-making tool, while leaving backend limitations undocumented on the public-facing marketing surface.

- [ ] **Step 4: Re-run the test to verify it passes**

Run: `npm run test:run -- tests/app/not-found.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/llms.txt/route.ts app/llms-full.txt/route.ts app/not-found.tsx tests/app/not-found.test.tsx
git commit -m "copy: align fallback routes with live product messaging"
```

### Task 6: Run final verification for the whole slice

**Files:**
- Verify only: `src/data/site.ts`
- Verify only: `src/lib/signs/metadata.ts`
- Verify only: `app/page.tsx`
- Verify only: `app/submit/page.tsx`
- Verify only: `src/components/submit/submit-form.tsx`
- Verify only: `app/signs/[slug]/page.tsx`
- Verify only: `src/components/signs/sign-detail.tsx`
- Verify only: `src/components/signs/download-sign-button.tsx`
- Verify only: `src/lib/signs/export-sign-asset.ts`

- [ ] **Step 1: Run the targeted test suite**

Run: `npm run test:run -- tests/app/home-page.test.tsx tests/app/submit-page.test.tsx tests/app/not-found.test.tsx tests/components/sign-detail.test.tsx tests/components/download-sign-button.test.tsx tests/lib/signs/metadata.test.ts tests/lib/signs/export-sign-asset.test.ts`
Expected: PASS.

- [ ] **Step 2: Run the production build**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 3: Manually verify the core routes if needed**

Run: `npm run dev`
Then check:

- `http://localhost:3000/`
- `http://localhost:3000/submit`
- `http://localhost:3000/signs/no-crown-for-a-clown`

Expected: no visible public beta wording on the public routes, and sign detail pages show a working `Download PNG` action.

- [ ] **Step 4: Commit**

```bash
git add app src tests
git commit -m "feat: add sign downloads and live-tool copy"
```
