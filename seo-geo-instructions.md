# Site SEO/GEO Instructions (2026)

Working checklist for AI search visibility (Gemini, ChatGPT, Perplexity, Claude) alongside traditional SEO. Use as a Cursor audit prompt.

**Hackfarm status** (rechecked 2026-08-28): foundations for Sections 0–4 are largely in place on the GitHub Pages preview. Open items and post-cutover ops live in [`docs/SEO-FOLLOWUP.md`](docs/SEO-FOLLOWUP.md). Checkboxes below reflect this repo (`[x]` done, `[ ]` open, `[~]` partial).

**Priority if doing this incrementally:** 0 → 1 → 2 → 4 → 5 → 6/7/8 → 9 → 3. Access, rendering, icons/OG, and schema/content beat `llms.txt` — that file is low-cost and optional, not a confirmed ranking or citation signal.

---

## 0. Crawler Access (do this first — blocks everything else if wrong)

- [x] Check `robots.txt` at site root. Confirm these are NOT disallowed:
  - `GPTBot`, `OAI-SearchBot`, `ChatGPT-User` (OpenAI)
  - `Google-Extended` (Gemini / AI Mode — distinct from `Googlebot`)
  - `ClaudeBot` (Anthropic)
  - `PerplexityBot`, `Perplexity-User`
  - `Applebot-Extended`
  - `Bytespider` — **Hackfarm:** intentionally `Disallow: /` (not targeting TikTok/Doubao)
- [x] CDN/WAF bot rules — **Hackfarm:** GitHub Pages only (no Cloudflare). Re-check if a CDN/WAF is added later; edge defaults can block AI bots even when `robots.txt` allows them.
- [ ] Check server/access logs for crawl activity from the above user agents — **blocked on GitHub Pages** (no access logs). Do after custom-domain / log-capable hosting.
- [x] Confirm no important content is gated behind login, paywall, or interactive-only reveal (modals/tabs that hide copy from HTML).

## 1. Rendering & Indexing (GitHub Pages / static hosting)

- [x] Pages are statically generated / pre-rendered (`scripts/prerender.mjs`) — AI crawlers largely do not execute JS.
- [ ] Custom domain with HTTPS enforced — preview still on `agent5479.github.io/hackfarm/`; cutover steps in `docs/SEO-FOLLOWUP.md`.
- [x] Explicit `<link rel="canonical">` on every page via `usePageMeta` (absolute; currently preview origin until cutover).
- [x] `sitemap.xml` present, generated, and referenced in `robots.txt`.
- [~] Validate robots/sitemap for stale URLs after cutover and any slug cleanups (e.g. `/privacy-policy-2/`).

## 2. Icons & Link-Preview Images

Favicon (browser tab / SERP icon) and social preview images (`og:image`) are separate systems.

- [ ] `favicon.ico` (multi-size ICO) at `/favicon.ico` — file not present under `public/` as of recheck.
- [ ] `<link rel="icon" href="…/favicon.ico" sizes="any">` in `<head>`.
- [~] PNG favicons — 32×32 linked in `index.html`; no dedicated 16×16 link.
- [x] `<link rel="apple-touch-icon" …>` present (180×180 upload asset).
- [ ] `site.webmanifest` / `manifest.json` with 192×192 and 512×512 icons + `<link rel="manifest">`.
- [ ] `theme-color` meta matching brand color.

### 2a. og:image

Primary driver of link-preview cards (iMessage, Slack, LinkedIn, Facebook, WhatsApp). Google SERP thumbnails use additional signals; do not treat `og:image` alone as a Google rich-result guarantee.

Required tags, every page, in `<head>`:
```html
<meta property="og:title" content="Exact page title">
<meta property="og:description" content="1-2 sentence page summary">
<meta property="og:image" content="https://yourdomain.com/images/og/page-slug.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:url" content="https://yourdomain.com/page-slug">
<meta property="og:type" content="website">

<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="https://yourdomain.com/images/og/page-slug.png">
```

Checklist:
- [x] `og:image` URL is **absolute** (via `absoluteAssetUrl`) — never relative.
- [x] Image is JPG/PNG, not SVG.
- [~] Prefer 1200×630 and under ~1MB — default OG uses a `-1200w` crop; many page images still point at full uploads, not dedicated OG crops.
- [ ] Set `og:image:width` and `og:image:height` explicitly in `usePageMeta`.
- [~] Distinct preview per major page/service where practical (rides, accommodation, horses, etc.) — not one homepage graphic reused everywhere.
- [x] Confirm OG assets ship in the deployed build (`public/` → Pages publish).
- [ ] After OG fixes, force re-scrape (Facebook Sharing Debugger, LinkedIn Post Inspector, Twitter Card Validator). Version-query (`?v=2`) if caches stick.
- [ ] Spot-check real rendering: `site:` search favicon, GSC URL Inspection, social debuggers — not tag presence alone.

## 3. llms.txt (optional, low priority)

Advisory Markdown index at `/llms.txt`. **Not a confirmed ranking or citation signal** for major AI search products as of mid-2026; crawlers mainly honour `robots.txt` and fetch HTML. Keep for low cost / future clients; do not prioritize over content or schema.

- [x] Published and generated (`scripts/generate-seo.mjs` → `public/llms.txt`) with brand blurb + key pages. On project Pages preview the file lives under `/hackfarm/llms.txt`, not host apex — move to domain root on cutover.
- [x] Hand-curated for this site (not a generic host default).

## 4. Structured Data (JSON-LD)

- [x] `Organization` (+ `LodgingBusiness`, geo, `sameAs`) in default site graph (`JsonLd` / `Layout`).
- [x] `SoftwareApplication` for first-party tools (FreshWDL; ride planner on Holistic Horse Rides).
- [x] Local entity + `Service` + geo — `LodgingBusiness` subtype used; dedicated service pages (not one mega-page).
- [x] `FAQPage` where FAQs exist (e.g. accommodation, gift vouchers) — answers standalone.
- [x] `HowTo` where procedural (gift vouchers).
- [x] `Person` on About (founder/entity page).
- [ ] Add `openingHours` (and tighten GBP alignment) once hours are confirmed — see `docs/SEO-FOLLOWUP.md`.

## 5. Content Strategy

- [~] Prefer proprietary tools, herd/horse pages, and first-party story over generic tourism boilerplate (Ride Planner, FreshWDL, service pages in place).
- [~] Extraction-friendly formatting (answer-first leads, clean H1→H2→H3, lists) — improve on evergreen pages as they are edited.
- [ ] Freshness cadence for rides / accommodation / about when offerings or prices change.

## 6. Local Business (Hackfarm)

- [~] Mirror Google Business Profile categories, services, hours, and NAP — structure is service-page based; hours/schema sync still open.
- [x] Distinct pages per major offering (accommodation, rides, trails, learning, vaulting, events) — no combined mega-services page.
- [~] Copy that matches how guests phrase reviews/prompts (beach/tides, beginners, kids camps, BYO horse, dogs) — keep pulling from real reviews where useful.
- [x] Local/`Service`/geo schema in the build + prerender (not client-only after a successful prerender).

## 7. Off-Site Authority

- [ ] Mentions in NZ tourism / Golden Bay / equestrian directories and publications (Wikidata/Wikipedia only if notability is real).
- [~] Consistent brand naming and NAP across Facebook, Instagram, TripAdvisor, and directories — maintain on an ongoing basis.

## 8. Branded Demand / Diversification

- [ ] Track branded search (Hack n Stay / Hack Farm) as a KPI alongside generic rank.
- [x] Non-search channels exist (Facebook, Instagram, TripAdvisor); keep amplifying so visibility is not 100% search-engine dependent.

## 9. Measurement

- [ ] Manual AI citation checks — periodically query ChatGPT, Perplexity, Gemini, and Claude with real prompts (e.g. beach rides Paton's Rock, farmstay Golden Bay) and log citations. GSC does not capture this.
- [ ] AI bot crawl tracking in logs — after custom-domain / log-capable hosting.

---

**Related:** [`docs/SEO-FOLLOWUP.md`](docs/SEO-FOLLOWUP.md) for domain cutover, GSC, GBP hours, and ops that cannot be finished on the Pages preview alone.
