# SEO follow-up (after technical foundation)

This site ships SEO foundations (per-route meta, robots/sitemap/`llms.txt` tied to the live host, JSON-LD including Organization/Service/FAQ/HowTo/Person/SoftwareApplication, prerender, About page) on GitHub Pages at **https://hackfarm.co.nz**.

## 1. Domain cutover

Done: DNS + Pages custom domain, `BASE_URL=/`, `VITE_SITE_ORIGIN=https://hackfarm.co.nz`, and `public/CNAME`.

Still check:

1. Enforce HTTPS in **Settings → Pages** once the certificate is ready.
2. Redirect `www.hackfarm.co.nz` ↔ apex to the canonical host (`hackfarm.co.nz`).

**Note:** Hosting is GitHub Pages (no Cloudflare WAF). After any CDN/WAF cutover, re-check dashboard bot rules separately from `robots.txt` — edge defaults can block AI bots even when robots allow them.

## 2. Post-cutover SEO ops

- Add a Google Search Console property for the live domain and submit `sitemap.xml`.
- Audit old WordPress URLs and add 301s (or GitHub Pages redirects) for anything that still receives traffic (including awkward slugs like `/privacy-policy-2/`).

## 3. Local / Google Business Profile

- Mirror GBP categories, services, hours, and NAP exactly on the site (add `openingHours` to schema/Contact once GBP hours are confirmed).
- Pull distinctive review phrases into ride/stay copy (beginners, beach/tides, kids camps, BYO horse, etc.).
- Keep service pages distinct; do not collapse offerings onto one mega-page.

## 4. Informationally additive packaging

- Done on-page: crawlable Ride Planner explainer on Holistic Horse Rides; FreshWDL SoftwareApplication in site graph; accommodation FAQs rendered with FAQPage schema.
- Avoid a generic tourism blog; prefer proprietary tools, horse/herd pages, and first-party story.
- Schedule a freshness pass on evergreen pages (rides, accommodation, about) when offerings or prices change.

## 5. Brand demand / diversification (off-site)

- Amplify Hack n Stay / Hack Farm branded search via Instagram, Facebook, TripAdvisor, email, and optional YouTube.
- Maintain at least one non-search channel so visibility is not 100% dependent on any single engine.
- Use the About page as the citeable brand/entity home; keep naming consistent in schema and titles.
- Track branded search volume (Hack n Stay / Hack Farm) as a KPI alongside generic keyword rank.

## 6. Off-site authority

- Identify mention opportunities in relevant NZ tourism directories, Golden Bay / Nelson Tasman guides, and equestrian publications.
- Keep NAP and brand naming consistent across Facebook, Instagram, TripAdvisor, and any directory listings.
- Wikidata/Wikipedia only if notability criteria are met — do not force thin entries.

## 7. Measurement (AI citations + crawls)

- Search Console does not capture AI citations. Periodically query ChatGPT, Perplexity, Gemini, and Claude with real target prompts (e.g. “beach horse rides Paton’s Rock”, “farmstay Golden Bay dogs horses”) and log which pages/competitors get cited.
- After custom-domain hosting with access logs (or a log-capable CDN), track AI bot user-agents separately from human traffic over time. GitHub Pages does not expose crawl logs for this preview.

## 8. Optional later

- Thin location-intent landing pages only if GBP/search data justifies them (not spam city pages).
- Stronger founder/story photography or media if useful for brand SERP previews.
