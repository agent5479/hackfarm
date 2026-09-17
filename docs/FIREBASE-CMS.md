# Firebase inline content editing (Realtime Database)

Marketing-page text can be edited by a signed-in owner. Visitors read the same copy from **Firebase Realtime Database**; if Firebase is unset or unreachable, the site uses bundled defaults in `src/content/defaults/*.json`.

This project uses **Realtime Database** (not Cloud Firestore) so the free tier can be enabled without a billing/credit-card upgrade in typical Spark setups.

## Console setup (step by step)

1. Open [Firebase Console](https://console.firebase.google.com/) → **Add project** (or pick an existing one). Stay on the **Spark (free)** plan if prompted.
2. Register a **Web** app: Project overview → **</>** Add app → nickname e.g. `hackfarm-web` → register (Hosting is optional).
3. **Authentication**
   - Build → Authentication → **Get started**
   - Sign-in method → **Email/Password** → Enable → Save
   - Users → **Add user** → owner email + password
4. **Realtime Database**
   - Build → Realtime Database → **Create Database**
   - Pick a region close to NZ visitors if offered (e.g. `australia-southeast1` / whatever Firebase lists)
   - Start in **locked mode**, then paste the rules below and **Publish**
5. **Authorized domains**
   - Authentication → Settings → Authorized domains
   - Add `localhost` and `hackfarm.co.nz` (and `www.hackfarm.co.nz` if you use it)
6. Copy config values (next section) into `.env.local` and GitHub secrets.

Do **not** create Cloud Firestore for this feature.

## Secrets / env vars required

These are the **web app config** values from  
**Project settings (gear) → Your apps → SDK setup and configuration → Config**.

They ship in the browser (not true secrets). Security is **Auth + Realtime Database rules**.

| Env / GitHub secret | Copy from Firebase config | Required |
|---|---|---|
| `VITE_FIREBASE_API_KEY` | `apiKey` | Yes |
| `VITE_FIREBASE_AUTH_DOMAIN` | `authDomain` | Yes |
| `VITE_FIREBASE_PROJECT_ID` | `projectId` | Yes |
| `VITE_FIREBASE_APP_ID` | `appId` | Yes |
| `VITE_FIREBASE_DATABASE_URL` | `databaseURL` | Yes |
| `VITE_FIREBASE_STORAGE_BUCKET` | `storageBucket` | Optional (SDK completeness) |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `messagingSenderId` | Optional |

### Where to find `databaseURL`

After Realtime Database is created:

- It appears in the web config as `databaseURL`, **or**
- Realtime Database → Data tab → URL in the header, e.g.  
  `https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com`  
  or  
  `https://YOUR_PROJECT_ID-default-rtdb.REGION.firebasedatabase.app`

Use the full `https://…` URL (no trailing slash).

### Local

Copy `.env.example` → `.env.local` and fill the values. Restart `npm run dev`.

### GitHub Actions (hackfarm.co.nz)

Repo → Settings → Secrets and variables → Actions → add each `VITE_FIREBASE_*` as a **repository secret**.  
[`.github/workflows/pages.yml`](../.github/workflows/pages.yml) already injects them into the production build.

**Not required:** service account JSON, Admin SDK keys, Cloud Functions, or a billing account for this design.

## Realtime Database security rules

In Realtime Database → Rules, replace `OWNER_EMAIL_HERE` with the owner’s login email, then Publish:

```json
{
  "rules": {
    "content": {
      ".read": true,
      ".write": "auth != null && auth.token.email == 'OWNER_EMAIL_HERE'"
    }
  }
}
```

After first login you can tighten write to a UID instead:

```json
".write": "auth != null && auth.uid == 'OWNER_UID_HERE'"
```

### Data paths

Marketing copy lives under:

```text
/content/{docId}
```

Document IDs (see `src/cms/docs.ts`): `home`, `rides`, `about`, `accommodation`, `learning`, `vaulting`, `events`, `gifts`, `trails`, `contact`, `partners`, `volunteer`, `privacy`, `horses`.

Defaults live in `src/content/defaults/{docId}.json`. Build-time snapshots land in `src/content/generated/{docId}.json`.

### Pre-load current site text (do this once before first deploy)

Writes each `src/content/defaults/{docId}.json` to `/content/{docId}` so the database is not empty. Skips paths that already have data unless `--force`.

1. In `.env.local`, set `FIREBASE_SEED_EMAIL` / `FIREBASE_SEED_PASSWORD` (owner Auth user) plus the usual `VITE_FIREBASE_*` values.
2. Run:

```bash
npm run cms-seed-home
```

3. Confirm in Firebase Console → Realtime Database that `/content/*` docs are populated.
4. To overwrite later: `npm run cms-seed-home -- --force`

## Owner workflow

1. Open `https://hackfarm.co.nz/edit/` (or `http://localhost:5173/edit/` in dev).
2. Sign in with the owner email/password.
3. Use the page links on `/edit/` — outlined fields are editable.
4. Edit text → **Save** or **Discard** on the bottom bar.
5. Sign out from `/edit/` when finished.

### Publish for Google / Bing (after Save)

Browsers pick up Saves from Realtime Database immediately. **Search indexes** need the text baked into the static HTML:

1. Owner **Saves** in `/edit/`.
2. Deploy `main` (GitHub Actions runs `scripts/fetch-home-content.mjs` before Vite/prerender, pulling each `/content/{docId}` into `src/content/generated/{docId}.json` so production HTML matches her copy).
3. Then request reindex in [Google Search Console](https://search.google.com/search-console) and [Bing Webmaster Tools](https://www.bing.com/webmasters) for affected URLs.

Local bake without a full deploy: `npm run cms-home` (needs `VITE_FIREBASE_DATABASE_URL` in `.env.local`), then `npm run build`.

## Rollback if a CMS deploy misbehaves

### Fast soft rollback (no git revert)

1. GitHub → Settings → Secrets and variables → Actions → add/set repository secret **`VITE_CMS_DISABLED`** = `1`.
2. Re-run the Pages workflow (or push an empty commit / Actions → “Run workflow”).
3. Production rebuilds with **bundled defaults only**: no RTDB fetch, no `/edit/` login, site looks like the pre-CMS copy in `src/content/defaults/*.json`.

To turn CMS back on: delete `VITE_CMS_DISABLED` (or set it empty) and redeploy.

### Hard rollback (restore previous `main`)

1. Before merging CMS, tag current stable: `git tag pre-cms-stable <commit-on-main>` and `git push origin pre-cms-stable`.
2. If needed: `git revert` the CMS merge commit(s) on `main` and push — Pages redeploys automatically.
3. Or reset `main` to `pre-cms-stable` only if you accept a force-push (prefer revert).

RTDB data is independent of the site deploy; disabling/reverting CMS does not delete `/content/*`.

## Notes

- Images, layout, and FareHarbor booking data stay out of CMS scope; only marketing copy strings are editable.
- Between deploys, visitors still load the latest RTDB text after page load; crawlers that use prerendered HTML see the last baked snapshot until the next deploy.
- Leaving Firebase env vars empty keeps the site on defaults only (login disabled; fetch script leaves empty `{}` snapshots).
- `FIREBASE_SEED_*` is local-only; never add it to GitHub Actions secrets.
