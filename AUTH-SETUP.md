# Turning on Google sign-in

The app requires login for **everyone** — except the login flow and the
internal `/render` route — once you set the anon key (step 5). Access is limited
to the emails in `ADMIN_EMAILS`. Until then the app stays open, so do these
steps in order; flip it on last.

> ⚠️ **Order matters.** Enable the Google provider in Supabase (steps 1–2)
> *before* setting `NEXT_PUBLIC_SUPABASE_ANON_KEY` (step 5). If you set the anon
> key first, the app locks but sign-in won't work yet.

---

## 1. Create a Google OAuth client

1. Go to [console.cloud.google.com](https://console.cloud.google.com) → create or pick a project.
2. **APIs & Services → OAuth consent screen:**
   - User type **External** → Create.
   - App name: `NomadGao Poster Studio`; pick your support email; add your email under Developer contact. Save.
   - Under **Audience / Test users**, add the Google emails of everyone who'll sign in (or click **Publish** to allow any allowlisted email). Test-user mode is fine for a small team.
3. **APIs & Services → Credentials → Create credentials → OAuth client ID:**
   - Application type: **Web application**, name `NomadGao`.
   - **Authorized redirect URIs** → add exactly:
     ```
     https://atrhuofopirqrqklyqkx.supabase.co/auth/v1/callback
     ```
   - Create, then copy the **Client ID** and **Client Secret**.

## 2. Enable Google in Supabase

Supabase dashboard → **Authentication → Sign In / Providers → Google**:
- Toggle **Enable**, paste the **Client ID** and **Client Secret**, Save.

## 3. Set the redirect URLs in Supabase

Supabase → **Authentication → URL Configuration**:
- **Site URL:** your live URL, e.g. `https://posterstudio-xxxx.vercel.app`
- **Redirect URLs** → add both:
  ```
  http://localhost:3000/auth/callback
  https://posterstudio-xxxx.vercel.app/auth/callback
  ```

## 4. Get the anon key

Supabase → **Settings → API** → copy the **`anon` `public`** key (the long
`eyJ…` labelled "anon", *not* the service_role one).

## 5. Set the environment variables (this turns auth ON)

**Locally** — in `nomadgao-app/.env.local` (already stubbed):
```
NEXT_PUBLIC_SUPABASE_URL=https://atrhuofopirqrqklyqkx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<paste the anon public key>
ADMIN_EMAILS=mayur@nomadgao.com           # comma-separate more teammates
```
Restart `npm run dev`.

**On Vercel** — Project → Settings → Environment Variables → add the same three
(`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `ADMIN_EMAILS`) for
**Production** → then **Redeploy** (Deployments → ⋯ → Redeploy) so they take effect.

## 6. Test

Open the app → you're redirected to **/login** → **Sign in with Google**:
- An allowlisted email → lands in the app, "Sign out" appears top-right.
- A non-allowlisted email → bounced back with "not on the approved list."

---

## Managing the team

- **Add/remove people:** edit `ADMIN_EMAILS` (comma-separated) locally and on
  Vercel, then redeploy. No code change.
- **Turn auth off temporarily:** remove `NEXT_PUBLIC_SUPABASE_ANON_KEY` and
  redeploy — the app reverts to open.
- Uploaded photos/logos remain stored in Supabase regardless of auth.
