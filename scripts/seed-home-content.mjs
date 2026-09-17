/**
 * Local seed: writes defaults to RTDB content/{docId} for all CMS docs.
 *
 * Requires .env.local with VITE_FIREBASE_* plus FIREBASE_SEED_EMAIL / FIREBASE_SEED_PASSWORD.
 * Skips each path if data already exists unless --force.
 *
 * Usage: npm run cms-seed-home
 *        npm run cms-seed-home -- --force
 *
 * Keep DOC_IDS in sync with src/cms/docs.ts.
 */
import { readFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { getDatabase, get, ref, set } from 'firebase/database';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const force = process.argv.includes('--force');

/** Must match CMS_DOC_IDS in src/cms/docs.ts */
const DOC_IDS = [
  'home',
  'rides',
  'about',
  'accommodation',
  'learning',
  'vaulting',
  'events',
  'gifts',
  'trails',
  'contact',
  'partners',
  'volunteer',
  'privacy',
  'horses',
];

const DOCS = DOC_IDS.map((id) => ({
  path: `content/${id}`,
  file: `src/content/defaults/${id}.json`,
}));

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return;
  const text = readFileSync(filePath, 'utf8');
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

loadEnvFile(join(root, '.env.local'));
loadEnvFile(join(root, '.env'));

function requireEnv(name) {
  const v = (process.env[name] || '').trim();
  if (!v) {
    throw new Error(`Missing ${name}. Set it in .env.local (see docs/FIREBASE-CMS.md).`);
  }
  return v;
}

async function seedDoc(db, doc) {
  const defaults = JSON.parse(readFileSync(join(root, doc.file), 'utf8'));
  const docRef = ref(db, doc.path);
  const existing = await get(docRef);
  if (existing.exists() && !force) {
    console.log(`seed: /${doc.path} already has data — skipped (pass --force to overwrite)`);
    return;
  }
  await set(docRef, defaults);
  console.log(
    force && existing.exists()
      ? `seed: overwrote /${doc.path}`
      : `seed: wrote defaults to /${doc.path}`,
  );
}

async function main() {
  const apiKey = requireEnv('VITE_FIREBASE_API_KEY');
  const authDomain = requireEnv('VITE_FIREBASE_AUTH_DOMAIN');
  const projectId = requireEnv('VITE_FIREBASE_PROJECT_ID');
  const appId = requireEnv('VITE_FIREBASE_APP_ID');
  const databaseURL = requireEnv('VITE_FIREBASE_DATABASE_URL').replace(/\/$/, '');
  const email = requireEnv('FIREBASE_SEED_EMAIL');
  const password = requireEnv('FIREBASE_SEED_PASSWORD');

  const app = initializeApp({
    apiKey,
    authDomain,
    projectId,
    appId,
    databaseURL,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || undefined,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || undefined,
  });

  const auth = getAuth(app);
  const db = getDatabase(app);

  try {
    console.log(`Signing in as ${email}…`);
    await signInWithEmailAndPassword(auth, email, password);
    for (const doc of DOCS) {
      await seedDoc(db, doc);
    }
  } finally {
    try {
      await signOut(auth);
    } catch {
      /* ignore */
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('seed-home-content failed:', err.message || err);
    process.exit(1);
  });
