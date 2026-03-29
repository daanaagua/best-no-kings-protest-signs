# Contact Page Design

## Goal

Add a lightweight `/contact` page to `bestnokingsprotestsigns.org` that embeds the user's Tally form and feels native to the existing site without introducing extra interaction logic.

## Confirmed Inputs

- Target route: `/contact`
- Tally form URL: `https://tally.so/r/vG48ad`
- Desired visible fields inside the embedded form: `name`, `email`, `message`
- Reference behavior: `https://www.myreadingspeed.top/contact`
- Chosen page direction: extreme minimal version with the form as the main content

## Proposed Approach

Create a new App Router page at `app/contact/page.tsx` as a server component. The page will render a minimal wrapper panel containing a single Tally iframe embed using the same embed pattern as the reference implementation.

The embed URL will use Tally's iframe form with these parameters:

- `alignLeft=1`
- `hideTitle=1`
- `transparentBackground=1`
- `dynamicHeight=1`

## UX and Visual Behavior

- No large page hero or prominent H1 in the visible body
- The form appears immediately within the site's existing paper-and-placard visual system
- A very small amount of spacing and optional micro-copy may be used only if needed for layout stability
- The iframe container should be full width within the content column and large enough to avoid cramped scrolling

## Site Integration

- Add `/contact` metadata with title, description, and canonical URL
- Add a `Contact` link to the footer so the route is discoverable alongside existing trust and policy pages
- Reuse existing global CSS patterns where possible instead of introducing a brand-new visual system

## Testing Scope

Add a route-level test that verifies:

- the contact page renders
- the iframe is present
- the iframe `src` points to the expected Tally embed with hidden-title parameters
- the footer exposes a `Contact` navigation link

## Out of Scope

- Building a native contact form
- Adding client-side validation or submission handling in Next.js
- Analytics changes specific to the contact form
- New header navigation for this route

## Notes

This spec is intentionally lightweight per user request. It is written as a direct handoff into implementation planning without a multi-round spec review cycle.
