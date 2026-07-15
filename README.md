# Virtual Australian International Airshow (VAIA)

Official website for **VAIA** — a VATSIM virtual special-operations demonstration
team flying formation and display routines out of Avalon Airport (YMAV),
Victoria, Australia.

This is a static site: plain HTML/CSS/JS, no build step, no dependencies.

## Structure

```
index.html      Home page
about.html      Mission, vSOA classification, flight currency & airspace
                coordination policy
roster.html     Public performance roster (pilots, callsigns, VATSIM CIDs)
schedule.html   Practice and public display calendar
contact.html    Recruitment / contact info
assets/css/     Shared stylesheet
assets/js/      Nav toggle + homepage countdown
assets/img/     Logo pack (cropped from the supplied artwork) + favicons
```

## Running locally

No build tools needed — just serve the folder:

```bash
python3 -m http.server 8080
# then open http://localhost:8080
```

## Before you launch this publicly

A few things are deliberately left as clearly-marked placeholders because
only you have the real data:

- **`roster.html`** — replace the "— Add Pilot Name —" rows with your actual
  rostered pilots' names, callsigns, and full VATSIM CIDs (only for pilots
  who've consented to publishing their CID), plus your real leadership team.
- **`schedule.html`** — replace the example season calendar with your
  confirmed practice and public display dates.
- **`index.html`** — update the `data-target` datetime on the `#countdown`
  element to match your real next public display.
- **`contact.html`** — add your real Discord invite link once the server
  exists (currently marked "coming soon"). The contact email is currently
  set to `angusjones185@gmail.com`.
- **VATSIM branding** — the footer "VATSIM Network Member" / "vSOA
  Demonstration Team" badges are plain text/CSS, not VATSIM's official
  logo artwork (which is trademarked). If you want the real VATSIM logo,
  download it from VATSIM's official brand kit and swap it in.

## Deploying

Deployed via GitHub Pages, built automatically by
`.github/workflows/pages.yml` on every push to `main`.

**Live at: https://vaustralianintlairshow.org**

The `CNAME` file in the repo root points GitHub Pages at that custom
domain. DNS at the registrar is set to GitHub Pages' addresses:

- Apex `A` records → `185.199.108.153`, `185.199.109.153`,
  `185.199.110.153`, `185.199.111.153`
- (optional) `AAAA` records → `2606:50c0:8000::153`, `2606:50c0:8001::153`,
  `2606:50c0:8002::153`, `2606:50c0:8003::153`

The old `https://angs231123.github.io/New-vaia/` URL still works and
redirects to the custom domain.

Any other static host (Netlify, Vercel, Cloudflare Pages, S3) would work
just as well — just upload the whole folder (minus `CNAME`, which is
GitHub Pages-specific).

## Logo pack

The four artwork variants supplied were cropped/cleaned into transparent
PNGs in `assets/img/`: `badge-light.png`, `badge-dark.png`,
`hero-banner.png`, `hangar-banner.png`, plus generated favicons.
