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

Since it's a static site, GitHub Pages is the easiest option:

1. Repo Settings → Pages → Deploy from branch → `main` / root.
2. Site will be live at `https://<username>.github.io/<repo>/`.

Any other static host (Netlify, Vercel, Cloudflare Pages, S3) will work
just as well — just upload the whole folder.

## Logo pack

The four artwork variants supplied were cropped/cleaned into transparent
PNGs in `assets/img/`: `badge-light.png`, `badge-dark.png`,
`hero-banner.png`, `hangar-banner.png`, plus generated favicons.
