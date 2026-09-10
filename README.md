# Hack Farm — React Site

React recreation of [hackfarm.co.nz](https://hackfarm.co.nz) for GitHub Pages hosting.

## Stack

- Vite + React + TypeScript
- React Router (trailing-slash URLs preserved)
- Static assets scraped from the live WordPress site

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build    # outputs to dist/ + copies 404.html for SPA routing
npm run preview
```

## Re-scrape assets

```bash
npm run scrape
```

Downloads images, fonts, FreshWDL weather files, and page copy from the live site into `public/` and `src/content/`.

## Environment

Copy `.env.example` to `.env.local` and set:

- `VITE_FORM_ENDPOINT` — form submission URL (defaults to FormSubmit)
- `VITE_SITE_ORIGIN` — canonical origin without path (`https://hackfarm.co.nz`)
- `VITE_NIWA_API_KEY` — optional live NIWA tide fetch in the Book a Ride planner
- Or set `NIWA_API_KEY` and run `npm run tides` to write `public/data/tides.json` without exposing the key

## Ride planner

**Book a Ride** opens a sunrise / tide / weather prequel for Paton’s Rock, then continues into the existing FareHarbor ride widget. Stay booking is unchanged.

## Deployment

GitHub Actions deploys **from `main`** to **https://hackfarm.co.nz**.

CSS, images, and routes use a `/` base. Canonicals, `robots.txt`, and `sitemap.xml` are generated for `VITE_SITE_ORIGIN` (default `https://hackfarm.co.nz`). `public/CNAME` keeps the custom domain on GitHub Pages.

See [docs/SEO-FOLLOWUP.md](docs/SEO-FOLLOWUP.md) for HTTPS, Search Console, and local-SEO follow-up.

## SEO build steps

`npm run build` runs:

1. `scripts/generate-seo.mjs` — writes `robots.txt` + `sitemap.xml`
2. Typecheck + Vite build
3. `scripts/copy-404.mjs` — SPA fallback for GitHub Pages
4. `scripts/prerender.mjs` — Playwright prerender of marketing routes into `dist/**/index.html`

## Features preserved

- FareHarbor booking (ride, stay, gift vouchers)
- Book a Ride planner (sunrise, tides, weather) before FareHarbor
- FreshWDL weather station (`https://hackfarm.infinityfree.me/FreshWDL/FreshWDL.html`; station FTPs `clientraw` files there)
- Google My Maps trail map
- Instagram grid (cached images)
- Contact, volunteer, partner, and ride-request forms
- 14 horse profile pages

## Future

Horse availability / Apps Script can plug into the Book a Ride planner later.
