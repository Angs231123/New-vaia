# vAIA — Virtual Australian International Airshow

Official website for **vAIA**, a community-run virtual recreation of the
Australian International Airshow, flown on Microsoft Flight Simulator with
live VATSIM air traffic control, hosted in partnership with VATSIM, VATPAC,
and RAAF Virtual (RAAFV). Next event: last weekend of January 2027.

Self-contained static pages, no build step, no dependencies.

## Structure

```
index.html      Home page — hero, countdown, about, schedule, performers,
                slot booking, ATC rules, gallery, FAQ, partners, contact
roster.html     Public active-pilot roster with VATSIM CIDs (VATSIM vSOA
                requirement)
privacy.html    GDPR Privacy Policy
CNAME           Custom domain for GitHub Pages
assets/img/     Favicons + official VATSIM logo (extracted at full quality
                from VATSIM's own Brand Guidelines PDF) + the old airshow
                badge artwork (currently unused by this template)
```

## VATSIM vSOA compliance — status

Per VATSIM's Special Operations policy, this site now has:

- ✅ Real VATSIM logo, linked to `vatsim.net`, in the homepage Partners section
- ✅ Public pilot roster (`roster.html`) showing VATSIM CIDs, linked from nav/footer
- ✅ GDPR consent banner on the homepage + a real Privacy Policy page
- ✅ HTTPS/SSL (handled automatically by GitHub Pages / Cloudflare Pages)

**Still outstanding — needs input only you can provide:**

- ⚠️ **VATSIM Special Operations logo** — not included in the Brand
  Guidelines PDF you sent (that PDF only has VATSIM's general logo). Get it
  from the official logo pack linked in that PDF (`vats.im/logo`) or from
  VATSIM's VP of Marketing (`vpmkt@vatsim.net`), then send it to me to drop
  into `assets/img/`.
- ⚠️ **VATPAC logo** — not supplied at all; same process.
- ⚠️ **RAAFV logo** — you pasted this inline in chat, but inline-pasted
  images aren't saved as files I can read, so I couldn't extract it. Please
  send it as an actual file upload/attachment and I'll add it.
- ⚠️ **Real roster data** — `roster.html` still has placeholder pilot rows;
  replace with real names/CIDs before this counts as compliant (only for
  pilots who consent to their CID being public).
- ⚠️ **Privacy Policy specifics** — fill in the bracketed placeholders
  (organiser/entity name, data retention period) in `privacy.html`.
- ⚠️ **"Login with VATSIM"** — the nav button is currently a visual
  placeholder only (doesn't do anything on click). Real VATSIM Connect
  login needs: (1) registering an OAuth app at vatsim.dev to get a client
  ID/secret, and (2) a small backend/serverless function (e.g. Cloudflare
  Pages Functions) to complete the OAuth code exchange — a client secret
  can't live safely in static HTML/JS. Happy to wire this up once you've
  registered the app.
- ⚠️ **"Paid hosting" requirement** — VATSIM's policy states free website
  builders aren't allowed for vSOA partners. This site runs on GitHub
  Pages/Cloudflare Pages (both free) with a custom domain you purchased —
  common practice for many VAs, but worth confirming directly with your
  vSOA contact whether that satisfies their "paid hosting" requirement or
  whether they specifically mean paid web hosting (e.g. a shared host).

## Running locally

```bash
python3 -m http.server 8080
# then open http://localhost:8080
```

## Deploying

Deployed via GitHub Pages, built automatically by
`.github/workflows/pages.yml` on every push to `main`, pointed at the
custom domain in `CNAME`.

**Live at: https://vaustralianintlairshow.org** (once your registrar's DNS
is pointed at GitHub Pages — see chat history for the exact A records).

To move to Cloudflare Pages instead: Cloudflare dashboard → Workers &
Pages → Create → Pages → Connect to Git → select this repo → leave build
command blank, output directory `/`. Note Cloudflare Pages has no built-in
form backend like Netlify, so any future booking/contact form needs
`mailto:`, an external form, or a service like Formspree.
