# vAIA — Virtual Australian International Airshow

Official website for **vAIA**, a community-run virtual recreation of the
Australian International Airshow, flown on Microsoft Flight Simulator with
live VATSIM air traffic control, hosted in partnership with VATSIM, VATPAC,
and RAAF Virtual (RAAFV). Next event: last weekend of January 2027.

## Structure

```
index.html          Home page — hero, countdown, about, schedule, performers,
                    slot booking, ATC rules, gallery, FAQ, partners, contact
roster.html          Public active-pilot roster (VATSIM vSOA requirement)
privacy.html         GDPR Privacy Policy
admin.html           Admin panel (add/edit/remove performers & roster) —
                    gated by VATSIM login, only works once deployed on
                    Cloudflare Pages (see "Admin & VATSIM login" below)
data/*.json          Fallback content for performers/roster — used when
                    there's no backend (e.g. plain GitHub Pages) or KV
                    has never been written to
functions/api/       Cloudflare Pages Functions: VATSIM OAuth login/
                    callback/logout/me, and performers/roster CRUD
CNAME                Custom domain for GitHub Pages
assets/img/          Favicons + official VATSIM logo (extracted at full
                    quality from VATSIM's own Brand Guidelines PDF)
```

The site works with **zero backend** (plain GitHub Pages) — the Performers
and Roster sections just read `data/performers.json` / `data/roster.json`
directly. The admin panel and "Login with VATSIM" only work once the site
is deployed on **Cloudflare Pages** (see below), because they need
serverless functions and a database, which GitHub Pages doesn't offer.

## Editing content manually (no login needed, works right now)

Open `data/performers.json` or `data/roster.json` in the repo, edit the
array, commit, and push — that's it. Both are consumed by `index.html` and
`roster.html` at page load. This works today regardless of which host
you're on.

## Admin panel & VATSIM login — setup

This only works once the site is on **Cloudflare Pages** (not GitHub
Pages — Pages Functions/KV are Cloudflare-specific). Steps, all one-time:

1. **Deploy to Cloudflare Pages**, connected to this GitHub repo (see the
   Cloudflare walkthrough earlier in this project's chat history, or:
   dash.cloudflare.com → Workers & Pages → Create → Pages → Connect to
   Git → this repo → leave build command blank, output directory `/`).

2. **Create a KV namespace** for the site's data: Cloudflare dashboard →
   Workers & Pages → KV → Create a namespace (call it e.g. `vaia-data`).
   Then in your Pages project → Settings → Functions → KV namespace
   bindings → add a binding named exactly **`VAIA_KV`** pointing at that
   namespace.

3. **Register a VATSIM Connect OAuth app** at https://vatsim.dev (their
   developer portal) to get a Client ID and Client Secret. Set the app's
   redirect URI to `https://<your-domain>/api/auth/callback`.

   > ⚠️ The OAuth endpoint URLs hardcoded in `functions/api/auth/login.js`
   > and `callback.js` (`auth.vatsim.net/oauth/...`) are VATSIM Connect's
   > commonly-documented routes, but I couldn't reach vatsim.dev from this
   > sandbox to verify them against the current official docs. **Double
   > check them against vatsim.dev when you register your app**, and let
   > me know if they've changed — it's a one-line fix.

4. **Set environment variables** on the Pages project (Settings →
   Environment variables — add for both Production and Preview):
   - `VATSIM_CLIENT_ID` — from step 3
   - `VATSIM_CLIENT_SECRET` — from step 3 (mark as a "secret" so it's not shown in the dashboard)
   - `SESSION_SECRET` — any long random string (e.g. generate one with `openssl rand -hex 32`), used to sign login sessions — mark as a secret
   - `ADMIN_CIDS` — your VATSIM CID (and any other admins' CIDs), comma-separated, e.g. `1234567,7654321`

5. **Redeploy** the Pages project so it picks up the new bindings/env
   vars (Cloudflare → Deployments → Retry deployment, or just push a
   commit).

6. Go to `/admin.html` on your live site and click **Login with VATSIM**.
   If your CID is in `ADMIN_CIDS`, you land in the admin panel; anyone
   else who logs in just gets bounced to the homepage. From there you can
   add/edit/remove Performers and Roster entries either via the tables or
   the raw-JSON boxes — both write to the same KV data.

### How the login/admin system works, briefly

- `/api/auth/login` redirects to VATSIM Connect; `/api/auth/callback`
  exchanges the code for a token, fetches your VATSIM CID, and — only if
  that CID is in `ADMIN_CIDS` — issues a signed session cookie (HMAC-SHA256
  via the Web Crypto API, no external libraries or database needed for
  sessions).
- `/api/performers` and `/api/roster`: `GET` is public (reads from KV,
  falling back to the bundled `data/*.json` if KV is empty); `POST`
  requires a valid admin session and overwrites the KV value with the
  posted JSON array.
- Non-admin VATSIM logins still succeed (so the login button works for any
  visitor) but get a plain session that the admin API/UI reject — nothing
  is left half-broken for regular users.

## VATSIM vSOA compliance — status

- ✅ Real VATSIM logo, linked to `vatsim.net`, in the homepage Partners section
- ✅ Public pilot roster (`roster.html`) showing VATSIM CIDs
- ✅ GDPR consent banner + Privacy Policy page
- ✅ HTTPS/SSL (automatic on GitHub Pages / Cloudflare Pages)
- ✅ VATSIM Connect login (once the setup above is complete)

**Still outstanding — needs input only you can provide:**

- ⚠️ **VATSIM Special Operations logo** — not in the Brand Guidelines PDF
  you sent (that one only has VATSIM's general logo). Get it from the
  official pack linked in that PDF (`vats.im/logo`) or VATSIM's VP of
  Marketing (`vpmkt@vatsim.net`), then send it to me.
- ⚠️ **VATPAC logo** and **RAAFV logo** — not available as files I can
  read (RAAFV was pasted inline in chat, which doesn't save as a file for
  me — please upload it as an actual attachment).
- ⚠️ **Real roster/performer data** — replace the placeholders in
  `data/performers.json` / `data/roster.json` (or via the admin panel)
  with real names/CIDs, only for pilots who consent to their CID being public.
- ⚠️ **Privacy Policy specifics** — fill in the bracketed placeholders in `privacy.html`.
- ⚠️ **"Paid hosting" requirement** — VATSIM's policy says free website
  builders aren't allowed for vSOA partners. This runs on Cloudflare
  Pages' free tier with a custom domain you purchased — common practice
  among VAs, but worth confirming directly with your vSOA contact whether
  that satisfies it or whether they mean literal paid web hosting.

## Running locally

```bash
python3 -m http.server 8080
# then open http://localhost:8080
```
`/api/*` routes won't exist locally this way — the site falls back to the
static `data/*.json` files automatically, same as it does on GitHub Pages.

## Deploying

Currently live via **GitHub Pages** (`.github/workflows/pages.yml`,
deploys on every push to `main`, custom domain via `CNAME`) at
**https://vaustralianintlairshow.org**. Content editing via the JSON files
works there. The admin panel and VATSIM login need Cloudflare Pages (see
above) — once that's live, point the domain's DNS at Cloudflare instead.
