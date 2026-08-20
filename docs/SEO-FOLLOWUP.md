# SEO follow-up (after technical foundation)

This site ships SEO foundations (per-route meta, robots/sitemap tied to the live host, JSON-LD, prerender, About page) while the preview remains on GitHub Pages.

## 1. Domain cutover

When ready to make this the official site:

1. Point DNS for `hackfarm.co.nz` / `www.hackfarm.co.nz` at GitHub Pages.
2. Set **Settings → Pages → Custom domain** to `www.hackfarm.co.nz` (pick one primary host).
3. Rebuild with `BASE_URL=/` and `VITE_SITE_ORIGIN=https://www.hackfarm.co.nz`.
4. Remove the workflow step that forces `cname: null`.
5. Enforce HTTPS in Pages settings; redirect apex ↔ www to the canonical host.

Until then, keep `BASE_URL=/hackfarm/` and `VITE_SITE_ORIGIN=https://agent5479.github.io` so the preview stays usable.

## 2. Post-cutover SEO ops

- Add a Google Search Console property for the live domain and submit `sitemap.xml`.
- Audit old WordPress URLs and add 301s (or GitHub Pages redirects) for anything that still receives traffic (including awkward slugs like `/privacy-policy-2/`).

## 3. Local / Google Business Profile

- Mirror GBP categories, services, hours, and NAP exactly on the site.
- Pull distinctive review phrases into ride/stay copy (beginners, beach/tides, kids camps, BYO horse, etc.).
- Keep service pages distinct; do not collapse offerings onto one mega-page.

## 4. Informationally additive packaging

- Add crawlable explainer copy for the sunrise/tide Ride Planner and on-site weather/tide utility (what it does, for whom, Paton’s Rock specifics).
- Avoid a generic tourism blog; prefer proprietary tools, horse/herd pages, and first-party story.

## 5. Brand demand (off-site)

- Amplify Hack n Stay / Hack Farm branded search via Instagram, Facebook, TripAdvisor, email, and optional YouTube.
- Use the About page as the citeable brand/entity home; keep naming consistent in schema and titles.

## 6. Optional later

- Thin location-intent landing pages only if GBP/search data justifies them (not spam city pages).
- Stronger founder/story photography or media if useful for brand SERP previews.
