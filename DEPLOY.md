# Deploying the NomadGao poster app

The app is a Next.js (App Router) project in this folder, backed by Supabase
(Postgres + Storage) and the Anthropic API (captions). It's already wired and
runs locally; these are the steps **only you** can do (they need your accounts).

This repo was initialised with one commit. The Supabase project is already set
up (schema migrated, `assets` bucket created, logos + sample photos uploaded),
so a fresh deploy will have a working library out of the box.

---

## 1. Push to GitHub

From this folder (`nomadgao-app/`):

```bash
# with the GitHub CLI:
gh repo create nomadgao-poster-app --private --source . --push

# …or manually:
git remote add origin https://github.com/<you>/nomadgao-poster-app.git
git push -u origin main
```

`.env.local` is gitignored, so your keys are **not** pushed. (`.env.example`
documents the variables.)

---

## 2. Import into Vercel

1. [vercel.com](https://vercel.com) → **Add New → Project** → import the repo.
2. Framework preset auto-detects **Next.js**. Root directory: the repo root
   (this folder). No build-command changes needed.
3. Add **Environment Variables** (Project → Settings → Environment Variables) —
   the same three from your `.env.local`:

   | Name | Value |
   |---|---|
   | `SUPABASE_URL` | `https://atrhuofopirqrqklyqkx.supabase.co` |
   | `SUPABASE_SERVICE_ROLE_KEY` | your `service_role` secret (server-only) |
   | `ANTHROPIC_API_KEY` | your Anthropic key (optional — templates if absent) |

   Set them for **Production** (and Preview if you want preview deploys to work).
4. **Deploy.**

---

## 3. Headless Chromium on Vercel (already wired)

`src/lib/render/screenshot.ts` auto-detects Vercel and uses
`puppeteer-core` + `@sparticuz/chromium` there (full `puppeteer` locally).
`next.config.ts` lists these in `serverExternalPackages` so they aren't bundled.
**No code change needed.** Two things to watch on the first deploy:

- **Function limits.** Poster rendering launches Chromium and can take several
  seconds. The render route sets `maxDuration = 60`. On the Vercel **Hobby**
  plan, functions are capped (≈10–60s) and memory is limited — if `/api/render`
  times out or OOMs, either bump the plan, raise the function's memory, or move
  rendering to a small separate service (Render.com / Railway) and call it from
  `/api/render` (this is the fallback noted in the original handoff).
- **Node version.** Use Node 20+ (Vercel default is fine).

---

## 4. First-run smoke test (on the *.vercel.app URL)

1. Open `/library` — logos + sample photos should show (already seeded).
2. Open `/` — the event-type dropdown loads from the DB.
3. Fill the form → **Generate the week** → posters render on screen with real
   photos; the week is saved to the `week`/`event` tables.
4. **Download PNG** on a poster — this exercises the serverless Chromium path.
   Confirm you get a 1080×1080 / 1080×1920 image.
5. **Refresh** a caption — with `ANTHROPIC_API_KEY` set, this calls Claude
   (otherwise on-brand templates).

---

## Setting up a *new* Supabase project (only if not reusing this one)

1. Create a project; copy **Project URL** + **service_role** key into the env vars.
2. SQL Editor → run `supabase/migrations/0001_init.sql`.
3. If the `storage.buckets` insert didn't apply, create a **public** bucket
   named `assets` under Storage.

---

## Local development

```bash
npm install
# create .env.local (see .env.example) with SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
npm run dev   # http://localhost:3000
```

Handy scripts (dev server must be running): `scripts/check-supabase.mjs`
(connection smoke test, run with `node --env-file=.env.local`),
`scripts/seed-library.mjs` (re-seed logos + sample photos).
