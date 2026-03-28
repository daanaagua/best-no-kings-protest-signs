# Best No Kings Protest Signs

Next.js App Router MVP for `BESTNOKINGSPROTESTSIGNS.ORG`.

## Local install and run

```bash
npm install
npm run dev
```

Open `http://localhost:3000` after the dev server starts.

## Commands

- Test suite: `npx vitest run`
- Interactive tests: `npm test`
- Lint: `npm run lint`
- Production build: `npm run build`
- Cloudflare adapter build: `npm run cf:build`
- Cloudflare preview in Workers runtime: `npm run preview`
- Cloudflare production deploy: `npm run deploy`
- Cloudflare non-production upload: `npm run upload`

## Static launch strategy

- Launch mode is intentionally static-content-first for `BESTNOKINGSPROTESTSIGNS.ORG`.
- Public content pages stay live and indexable, including homepage, category pages, top pages, sign details, trust pages, and the `/submit` preview route.
- The public `/submit` experience is preview-only beta for launch and does not create live server-side submission records.
- Public voting is disabled in the launch UX and the public write APIs return beta-gated responses instead of persisting new writes.
- `/internal/moderation` is now a static internal placeholder page, not a live moderation dashboard in the Worker runtime.
- Next App Router SEO files now generate from `app/robots.ts` and `app/sitemap.ts`.
- Public content now reads from the launch dataset only, so the Worker runtime does not depend on local JSON file reads.

## Content and data locations

- Seed sign data for the launch collection: `src/data/signs.ts`
- Official sign asset path map: `src/data/sign-assets.ts`
- Official SVG sign assets: `public/signs/`
- Approved and pending submissions in the MVP: `data/submissions.json`
- Stored vote totals in the MVP: `data/votes.json`

For the static launch, `data/submissions.json` and `data/votes.json` are retained as MVP-era local data files, not production-ready public write infrastructure.

When you add a new official sign, place the asset in `public/signs/`, add its public path in
`src/data/sign-assets.ts`, and reference it from `src/data/signs.ts`.

## Moderation token

Create `.env.local` in the project root with a token for the protected moderation screen:

```bash
MODERATION_TOKEN=replace-with-a-long-random-secret
```

The token is reserved for future durable moderation workflows. The current launch keeps moderation as an internal placeholder, not a production live queue.

## Domain

The registered domain for this project is `BESTNOKINGSPROTESTSIGNS.ORG`.

## Cloudflare Workers deployment path

This repo is configured for the OpenNext Cloudflare adapter.

### Files added for Workers

- `wrangler.jsonc`
- `open-next.config.ts`
- `.dev.vars`
- `public/_headers`

### Local Worker verification

1. Install dependencies: `npm install`
2. Build the Next app normally: `npm run build`
3. Build the Cloudflare Worker bundle: `npm run cf:build`
4. Optionally preview in the Workers runtime: `npm run preview`

### Workers Builds dashboard settings

- Build command: `npx @opennextjs/cloudflare build`
- Deploy command: `npx @opennextjs/cloudflare deploy`
- Non-production branch deploy command: `npx @opennextjs/cloudflare upload`

### Environment variables / secrets

- Optional for future internal workflows: `MODERATION_TOKEN`

### Important launch note

This launch is still intentionally static-content-first:

- public content routes are production-ready for Cloudflare Workers
- public submit and vote actions are beta-gated and do not perform live writes
- the old local JSON persistence model is retained only as MVP-era code and test support, not as production Worker storage

Before restoring real public submissions, voting, or moderation in production, move those flows to durable Cloudflare storage such as D1 / KV / R2 depending on the final product design.
