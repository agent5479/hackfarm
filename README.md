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

## Deployment

GitHub Actions workflow (`.github/workflows/pages.yml`) builds and deploys **from `main`** at the **domain root**. CSS and images are always `/assets/...` and `/images/...` so they keep working on `https://www.hackfarm.co.nz/` after DNS is live.

1. Pages source is already **GitHub Actions**
2. In the repo: **Settings → Pages → Custom domain** = `www.hackfarm.co.nz`, then enable **Enforce HTTPS**
3. DNS: `www` CNAME → `agent5479.github.io` (apex A records as GitHub lists)

Do not preview the site at `https://agent5479.github.io/hackfarm/` — that project URL has no styles because this build is for the custom domain root, not `/hackfarm/`. After DNS, use `https://www.hackfarm.co.nz/`.

## Features preserved

- FareHarbor booking (ride, stay, gift vouchers)
- FreshWDL weather station (`/FreshWDL/FreshWDL.html`)
- Google My Maps trail map
- Instagram grid (cached images)
- Contact, volunteer, partner, and ride-request forms
- 14 horse profile pages

## Future

`src/booking/` stub reserved for the calendar applet (Google Apps Script, weather/tides, horse availability).
