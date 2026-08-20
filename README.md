# Hack Farm — React Site

React recreation of [hackfarm.co.nz](https://www.hackfarm.co.nz) for GitHub Pages hosting.

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
- `VITE_SITE_ORIGIN` — canonical origin without path (preview: `https://agent5479.github.io`)
- `VITE_NIWA_API_KEY` — optional live NIWA tide fetch in the Book a Ride planner
- Or set `NIWA_API_KEY` and run `npm run tides` to write `public/data/tides.json` without exposing the key

## Ride planner

**Book a Ride** opens a sunrise / tide / weather prequel for Paton’s Rock, then continues into the existing FareHarbor ride widget. Stay booking is unchanged.

## Deployment

GitHub Actions deploys **from `main`**. Until DNS is live, the site is built for the project URL:

**https://agent5479.github.io/hackfarm/**

CSS, images, and routes all use the `/hackfarm/` base. Canonicals, `robots.txt`, and `sitemap.xml` are generated for `VITE_SITE_ORIGIN` (default `https://agent5479.github.io`) so they match the preview host.

After you point DNS, add `www.hackfarm.co.nz` in **Settings → Pages → Custom domain**, then rebuild with `BASE_URL=/` and `VITE_SITE_ORIGIN=https://www.hackfarm.co.nz`. See [docs/SEO-FOLLOWUP.md](docs/SEO-FOLLOWUP.md) for the full cutover and local-SEO checklist.

Do not leave a custom domain set in Pages (or a `CNAME` file) until DNS actually resolves — GitHub will hide the `github.io` preview.

## SEO build steps

`npm run build` runs:

1. `scripts/generate-seo.mjs` — writes `robots.txt` + `sitemap.xml`
2. Typecheck + Vite build
3. `scripts/copy-404.mjs` — SPA fallback for GitHub Pages
4. `scripts/prerender.mjs` — Playwright prerender of marketing routes into `dist/**/index.html`

## Features preserved

- FareHarbor booking (ride, stay, gift vouchers)
- Book a Ride planner (sunrise, tides, weather) before FareHarbor
- FreshWDL weather station (`/FreshWDL/FreshWDL.html`)
- Google My Maps trail map
- Instagram grid (cached images)
- Contact, volunteer, partner, and ride-request forms
- 14 horse profile pages

## Future

Horse availability / Apps Script can plug into the Book a Ride planner later.
