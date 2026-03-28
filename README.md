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

## Static launch strategy

- Launch mode is intentionally static-content-first for `BESTNOKINGSPROTESTSIGNS.ORG`.
- Public content pages stay live and indexable, including homepage, category pages, top pages, sign details, trust pages, and the `/submit` preview route.
- The public `/submit` experience is preview-only beta for launch and does not create live server-side submission records.
- Public voting is disabled in the launch UX and the public write APIs return beta-gated responses instead of persisting new writes.
- `/internal/moderation` remains available as an internal token-gated beta route, but it is not framed as a public launch feature.
- Next App Router SEO files now generate from `app/robots.ts` and `app/sitemap.ts`.

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

Then open `/internal/moderation?token=YOUR_TOKEN` locally.

This route is internal-only for launch and should not be presented as a public production workflow.

## Domain

The registered domain for this project is `BESTNOKINGSPROTESTSIGNS.ORG`.

## Cloudflare deployment path

Simple MVP path:

1. Push this repository to GitHub.
2. Create a Cloudflare Pages project connected to the repo.
3. Set the production environment variable `MODERATION_TOKEN` in Cloudflare only if you need the internal moderation beta route.
4. Use `npm run build` as the build command.
5. Deploy the public site as a static-content-first launch, keeping public submissions and public voting beta-gated.
6. Replace the file-backed `data/submissions.json` and `data/votes.json` storage with durable cloud storage before restoring any production public write flows.

The public pages can launch this way today, but the old MVP persistence model is still local-file based and should not be treated as production-ready public write infrastructure until durable storage is wired in.
