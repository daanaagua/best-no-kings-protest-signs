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

## Content and data locations

- Seed sign data for the launch collection: `src/data/signs.ts`
- Official sign asset path map: `src/data/sign-assets.ts`
- Official SVG sign assets: `public/signs/`
- Approved and pending submissions in the MVP: `data/submissions.json`
- Stored vote totals in the MVP: `data/votes.json`

When you add a new official sign, place the asset in `public/signs/`, add its public path in
`src/data/sign-assets.ts`, and reference it from `src/data/signs.ts`.

## Moderation token

Create `.env.local` in the project root with a token for the protected moderation screen:

```bash
MODERATION_TOKEN=replace-with-a-long-random-secret
```

Then open `/internal/moderation?token=YOUR_TOKEN` locally.

## Domain

The registered domain for this project is `BESTNOKINGSPROTESTSIGNS.ORG`.

## Cloudflare deployment path

Simple MVP path:

1. Push this repository to GitHub.
2. Create a Cloudflare Pages project connected to the repo.
3. Set the production environment variable `MODERATION_TOKEN` in Cloudflare.
4. Use `npm run build` as the build command.
5. Deploy the public site, then replace the file-backed `data/submissions.json` and `data/votes.json`
   storage with durable cloud storage before relying on live moderation or vote writes in production.

The public pages can be previewed this way, but the current MVP persistence model is local-file based and is
best suited to local development until durable storage is wired in.
