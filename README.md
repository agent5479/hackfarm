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

GitHub Actions workflow (`.github/workflows/pages.yml`) builds and deploys on push to `main`.

1. Enable GitHub Pages → Source: **GitHub Actions**
2. Push to `github.com/agent5479/hackfarm`
3. Point DNS: `www.hackfarm.co.nz` CNAME → `agent5479.github.io`

`public/CNAME` is set to `www.hackfarm.co.nz`.

## Features preserved

- FareHarbor booking (ride, stay, gift vouchers)
- FreshWDL weather station (`/FreshWDL/FreshWDL.html`)
- Google My Maps trail map
- Instagram grid (cached images)
- Contact, volunteer, partner, and ride-request forms
- 14 horse profile pages

## Future

`src/booking/` stub reserved for the calendar applet (Google Apps Script, weather/tides, horse availability).
