/**
 * Notify IndexNow (Bing + partners) of URLs from the live sitemap.
 * Key file must be live at /{key}.txt before submissions succeed.
 *
 * Env:
 *   INDEXNOW_KEY     — API key (default: key used for hackfarm.co.nz)
 *   INDEXNOW_ORIGIN  — site origin (default: https://hackfarm.co.nz)
 *   INDEXNOW_WAIT_MS — wait for key file before submit (default: 60000)
 */
const KEY = process.env.INDEXNOW_KEY || '35782e155bff459191f86b0449bc2ab0';
const ORIGIN = (process.env.INDEXNOW_ORIGIN || 'https://hackfarm.co.nz').replace(/\/$/, '');
const WAIT_MS = Number(process.env.INDEXNOW_WAIT_MS ?? 60_000);
const host = new URL(ORIGIN).host;
const keyLocation = `${ORIGIN}/${KEY}.txt`;
const sitemapUrl = `${ORIGIN}/sitemap.xml`;
const endpoint = 'https://api.indexnow.org/indexnow';

async function fetchText(url) {
  const res = await fetch(url, { redirect: 'follow' });
  if (!res.ok) throw new Error(`${url} → HTTP ${res.status}`);
  return res.text();
}

async function waitForKeyFile() {
  const deadline = Date.now() + WAIT_MS;
  let lastErr = null;
  while (Date.now() < deadline) {
    try {
      const body = (await fetchText(keyLocation)).trim();
      if (body === KEY) return;
      lastErr = new Error(`Key file content mismatch at ${keyLocation}`);
    } catch (err) {
      lastErr = err;
    }
    await new Promise((r) => setTimeout(r, 5000));
  }
  throw lastErr ?? new Error(`Timed out waiting for ${keyLocation}`);
}

function parseSitemapUrls(xml) {
  const urls = [...xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi)].map((m) => m[1].trim());
  return [...new Set(urls)].filter((u) => {
    try {
      return new URL(u).host === host;
    } catch {
      return false;
    }
  });
}

async function main() {
  console.log('IndexNow: waiting for key file', keyLocation);
  await waitForKeyFile();
  console.log('IndexNow: key file OK');

  const xml = await fetchText(sitemapUrl);
  const urlList = parseSitemapUrls(xml);
  if (!urlList.length) throw new Error(`No URLs for host ${host} in ${sitemapUrl}`);

  console.log(`IndexNow: submitting ${urlList.length} URLs for ${host}`);
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host, key: KEY, keyLocation, urlList }),
  });

  const text = await res.text();
  if (res.status === 200 || res.status === 202) {
    console.log(`IndexNow: OK (${res.status})`, text || '(empty body)');
    return;
  }
  throw new Error(`IndexNow failed: HTTP ${res.status} ${text}`);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
