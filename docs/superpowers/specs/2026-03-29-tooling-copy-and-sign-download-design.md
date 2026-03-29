# Tooling Copy And Sign Download Design

## Goal

Update the public site copy so `bestnokingsprotestsigns.org` reads like a usable sign-making and sign-browsing tool instead of a launch-beta preview, and add a real `Download PNG` action on sign detail pages for every displayed sign.

## Confirmed Inputs

- Public-facing pages should stop using `beta`, `static launch`, and `preview-only` language.
- Real public voting and public submissions should remain disabled at the backend level for now.
- The public site should still feel complete and usable to visitors.
- Every detail page sign should expose a `Download PNG` action.
- Download behavior should always produce a real `.png` file, including future community/user-uploaded signs.

## Proposed Approach

Keep backend launch guards in place, but rewrite public copy so the site presents itself as an active archive plus sign-maker tool. On detail pages, replace the visible launch-gated voting messaging with a tool-oriented action set centered on sharing and PNG download.

The download feature will use a small client-side export path that loads the displayed sign asset, draws it to a canvas, and downloads a `.png` file. This keeps the UX consistent for both existing raster assets and current community SVG assets.

## Public Copy Changes

- Remove public-facing `beta`, `preview-only`, and `static launch` phrasing from homepage, submit page, sign detail support copy, metadata descriptions, 404 page, and public machine-readable route text.
- Reposition `/submit` as a usable sign maker / sign builder that visitors can use immediately for slogan editing, board switching, and PNG export.
- Keep internal moderation messaging internal-only, but avoid site-wide wording that makes the product feel unfinished.

## Sign Detail Download Behavior

- Add a `Download PNG` control to the detail-page action area.
- Keep the vote count badge as informational UI only.
- Keep `Share this sign` available.
- Remove the public-facing disabled-vote call to action and the visible “voting disabled” launch copy from the detail-page experience.

## Export Strategy

- Add a new client-side sign-asset export utility separate from the submit preview exporter.
- For `.png`, `.jpg`, `.jpeg`, `.webp`, and `.svg` assets, fetch the current asset, render it through an image/canvas pipeline, and export a PNG file.
- Reuse the existing filename sanitizing convention so downloads are predictable and SEO-safe.
- Fail gracefully if the asset cannot be exported.

## Testing Scope

Add or update tests that verify:

- public pages no longer render the previous beta copy
- `/submit` now reads like a live tool page rather than a deferred preview flow
- sign detail pages render a `Download PNG` action
- PNG export utilities produce a `.png` filename and trigger download behavior for supported image assets
- existing backend public-write guards remain unchanged unless explicitly edited later

## Out of Scope

- Opening real public voting
- Opening real public submission writes
- Building account systems or moderation workflows for future uploads
- Server-side image generation infrastructure

## Notes

This spec is intentionally lightweight per user preference. It is meant to hand off directly into implementation planning without a multi-round spec review cycle.
