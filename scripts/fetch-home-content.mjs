/**
 * Pulls RTDB CMS docs into src/content/generated/*.json before vite build
 * so prerender embeds the owner's saved copy. Soft-fails (exit 0) if unset/empty/offline.
 */
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const DOCS = [
  { path: 'content/home', out: join(root, 'src/content/generated/home.json'), label: 'home' },
  { path: 'content/rides', out: join(root, 'src/content/generated/rides.json'), label: 'rides' },
];

function databaseUrl() {
  const raw = (process.env.VITE_FIREBASE_DATABASE_URL || '').trim().replace(/\/$/, '');
  return raw || null;
}

function ensureStub(outFile) {
  if (!existsSync(outFile)) {
    writeFileSync(outFile, '{}\n', 'utf8');
    console.log(`fetch-home-content: created empty stub ${outFile}`);
  }
}

async function fetchDoc(base, doc) {
  const url = `${base}/${doc.path}.json`;
  try {
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) {
      console.warn(`fetch-home-content: HTTP ${res.status} for ${doc.label} — keeping existing snapshot`);
      ensureStub(doc.out);
      return;
    }
    const data = await res.json();
    if (data == null || (typeof data === 'object' && !Array.isArray(data) && Object.keys(data).length === 0)) {
      console.log(`fetch-home-content: /${doc.path} empty — keeping existing snapshot`);
      ensureStub(doc.out);
      return;
    }
    writeFileSync(doc.out, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
    console.log(`fetch-home-content: wrote ${doc.label}`);
  } catch (err) {
    console.warn(`fetch-home-content: ${doc.label} fetch failed — keeping snapshot:`, err.message || err);
    ensureStub(doc.out);
  }
}

async function main() {
  for (const doc of DOCS) {
    mkdirSync(dirname(doc.out), { recursive: true });
  }

  const disabled = (process.env.VITE_CMS_DISABLED || '').trim().toLowerCase();
  if (disabled === '1' || disabled === 'true' || disabled === 'yes') {
    for (const doc of DOCS) {
      writeFileSync(doc.out, '{}\n', 'utf8');
    }
    console.log('fetch-home-content: VITE_CMS_DISABLED set — using bundled defaults only');
    return;
  }

  const base = databaseUrl();
  if (!base) {
    console.log('fetch-home-content: VITE_FIREBASE_DATABASE_URL unset — keeping existing snapshots');
    for (const doc of DOCS) ensureStub(doc.out);
    return;
  }

  await Promise.all(DOCS.map((doc) => fetchDoc(base, doc)));
}

main();
