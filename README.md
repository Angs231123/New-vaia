# vAIA — Virtual Australian International Airshow

Official website for **vAIA**, a community-run virtual recreation of the
Australian International Airshow, flown across MSFS, P3D & X-Plane with
live ATC coverage.

This is a single self-contained static page: `index.html` has its CSS and
JS inline, no build step, no dependencies.

## Structure

```
index.html      The entire site (hero, countdown, about, schedule,
                squadrons, slot booking, ATC rules, gallery, FAQ,
                partners, contact) — sections are anchor-linked from
                the nav bar, e.g. #schedule, #booking, #rules
assets/img/     Favicons (badge artwork from the earlier version of
                the site; no longer referenced inline on the page)
CNAME           Custom domain for GitHub Pages
```

## ⚠️ Before you publish this live

This template ships with a lot of **`[bracketed placeholder]`** text
(shown in red) that needs replacing before it's public-ready:

- Hero stats: event date, ATC network
- About section copy
- Schedule table times
- Squadron/display team names
- Slot booking / ATC roster / livestream links
- ATC frequencies, display altitude limits, briefing links
- Gallery images (currently just placeholder blocks)
- FAQ answers
- Discord / Twitch / YouTube / Instagram links (currently `#`)
- The countdown target date in the inline `<script>` (`EVENT_DATE`)

Search the file for `placeholder` / `[` to find every spot.

There's no application form or roster page in this version — booking
and joining route entirely through the "Book Your Slot" and "Join
Discord" links, so update those `href`s once you have a real form and
Discord invite.

## Running locally

```bash
python3 -m http.server 8080
# then open http://localhost:8080
```

## Deploying

Currently deployed via GitHub Pages, built automatically by
`.github/workflows/pages.yml` on every push to `main`, and pointed at
the custom domain in `CNAME`:

**Live at: https://vaustralianintlairshow.org**

If you move hosting to Cloudflare Pages instead:

1. Cloudflare dashboard → **Workers & Pages → Create → Pages → Connect to Git**.
2. Select this repo (`Angs231123/New-vaia`).
3. Build settings: leave **Build command** blank, **Build output
   directory** = `/` (repo root).
4. Deploy — Cloudflare gives you a `*.pages.dev` URL immediately.
5. To use the custom domain: Pages project → **Custom domains → Set up
   a custom domain** → enter `vaustralianintlairshow.org`. If the
   domain's nameservers are already on Cloudflare, this is a one-click
   attach with no manual DNS records. If not, Cloudflare will show you
   the CNAME/A record to add at your current registrar.
6. Note: Cloudflare Pages doesn't have a built-in form backend like
   Netlify — if you add a real booking/contact form later, use a
   `mailto:` link, an external form (Google Forms/Discord bot, as this
   template already assumes), or a service like Formspree.

Both GitHub Pages and Cloudflare Pages can run off this same repo at
the same time (different default URLs); only one should own the
custom domain at once — whichever DNS points to.
