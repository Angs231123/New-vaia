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
                    gated by a normal username/password login, only works
                    once deployed on Cloudflare Pages (see "Admin login" below)
data/*.json          Fallback content for performers/roster — used when
                    there's no backend (e.g. plain GitHub Pages) or KV
                    has never been written to
_worker.js           The entire backend (admin login/logout/me, performers/
                    roster CRUD) as a single Cloudflare Pages Worker file —
                    one file, no imports, so it works with every Cloudflare
                    deployment method including dashboard drag-and-drop
wrangler.toml        Declares the VAIA_KV binding for `wrangler pages deploy`
CNAME                Custom domain for GitHub Pages
assets/img/          Favicons + official VATSIM logo (extracted at full
                    quality from VATSIM's own Brand Guidelines PDF)
```

The site works with **zero backend** (plain GitHub Pages) — the Performers
and Roster sections just read `data/performers.json` / `data/roster.json`
directly. The admin panel only works once the site is deployed on
**Cloudflare Pages** (see below), because it needs serverless functions and
a database, which GitHub Pages doesn't offer.

## Editing content manually (no login needed, works right now)

Open `data/performers.json` or `data/roster.json` in the repo, edit the
array, commit, and push — that's it. Both are consumed by `index.html` and
`roster.html` at page load. This works today regardless of which host
you're on.

## Admin panel — setup

This only works once the site is on **Cloudflare Pages** (not GitHub
Pages — Pages Functions/KV are Cloudflare-specific). Steps, all one-time:

1. **Deploy to Cloudflare Pages**, connected to this GitHub repo (see the
   Cloudflare walkthrough earlier in this project's chat history, or:
   dash.cloudflare.com → Workers & Pages → Create → Pages → Connect to
   Git → this repo → leave build command blank, output directory `/`).

2. **Create a KV namespace** for the site's data: Cloudflare dashboard →
   Workers KV → Create instance (call it e.g. `vaia-data`). Then bind it
   to the Pages project: project → **Bindings** tab → Add binding → KV
   namespace → variable name **`VAIA_KV`** → select that namespace.

   > If that "Add binding" button doesn't actually save anything (known
   > dashboard bug we hit — clicking it fires no network request and the
   > binding never appears under Connected Bindings), skip the dashboard
   > entirely and run one deploy from your own computer instead:
   > ```
   > git clone https://github.com/Angs231123/New-vaia.git
   > cd New-vaia
   > npx wrangler login
   > npx wrangler pages deploy
   > ```
   > This reads the KV namespace ID already saved in `wrangler.toml` and
   > sets the binding as part of the deploy. Once it's set this way, it's a
   > project-level setting — later deploys via Git push or drag-and-drop
   > keep using it, you don't need to repeat this.

3. **Set environment variables** on the Pages project (Settings →
   Environment variables — add for both Production and Preview):
   - `ADMIN_USERNAME` — whatever username you want to log in with
   - `ADMIN_PASSWORD` — a strong password (mark it as a "secret" so it's not shown in the dashboard)
   - `SESSION_SECRET` — any long random string (e.g. generate one with `openssl rand -hex 32`), used to sign login sessions — mark as a secret

4. **Redeploy** the Pages project so it picks up the new bindings/env
   vars (Cloudflare → Deployments → Retry deployment, or just push a
   commit).

5. Go to `/admin.html` on your live site and log in with the username/
   password from step 3. From there you can add/edit/remove Performers and
   Roster entries either via the tables or the raw-JSON boxes — both write
   to the same KV data.

### How the login/admin system works, briefly

- `/api/auth/login` checks the posted username/password against
  `ADMIN_USERNAME`/`ADMIN_PASSWORD` and, if they match, issues a signed
  session cookie (HMAC-SHA256 via the Web Crypto API — no external
  libraries or database needed for sessions).
- `/api/performers` and `/api/roster`: `GET` is public (reads from KV,
  falling back to the bundled `data/*.json` if KV is empty); `POST`
  requires a valid admin session and overwrites the KV value with the
  posted JSON array.
- All of the above lives in one file, `_worker.js` — deliberately not
  split up, so it works no matter which of the three Cloudflare deploy
  methods you use (Git push, `wrangler pages deploy`, or dashboard
  drag-and-drop, see below).

## Updating the live site without git — drag and drop

Once the KV binding is set up (one-time, see above), you can update the
site by dragging the project folder into Cloudflare's dashboard instead of
using git or the terminal:

1. Edit files locally (or download the repo as a zip from GitHub and
   unzip it) — e.g. edit `data/performers.json`, or drop a new photo into
   `assets/img/`.
2. In the Cloudflare dashboard, go to your **new-vaia** Pages project →
   **Deployments** tab → look for a button to create a new deployment /
   upload (wording varies — something like "Create deployment" or
   "Upload assets").
3. Drag the whole project folder in (or select it) and deploy.

This deploys the same `_worker.js` backend as any other method, so admin
login and the API keep working — that's the whole reason the backend was
combined into one file instead of the `functions/` folder Cloudflare Pages
normally expects (drag-and-drop deployments don't support that folder at
all).

## VATSIM vSOA compliance — status

- ✅ Real VATSIM logo, linked to `vatsim.net`, in the homepage Partners section
- ✅ Public pilot roster (`roster.html`) showing VATSIM CIDs
- ✅ GDPR consent banner + Privacy Policy page
- ✅ HTTPS/SSL (automatic on GitHub Pages / Cloudflare Pages)

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
works there. The admin panel needs Cloudflare Pages (see above) — once
that's live, point the domain's DNS at Cloudflare instead.
