# Google Apps Script form backend

Sends Hack Farm website form submissions to `baerbelhack@gmail.com`.

## Deploy

1. Open [script.google.com](https://script.google.com) while logged into **baerbelhack@gmail.com**.
2. New project → paste [`Code.gs`](./Code.gs) (replace the default file).
3. **Deploy** → **New deployment** → type **Web app** (or Manage deployments → edit → **New version**).
4. Execute as: **Me**. Who has access: **Anyone** (must allow anonymous — not only signed-in Google users).
5. Authorize Gmail when prompted (Review permissions → Allow).
6. Copy the Web app URL ending in `/exec`.
7. Open that URL in an **incognito** window. You should see `{"ok":true,"service":"hackfarm-forms"}`. If you see “You need access”, the deployment is still private — create a fresh **New deployment** and copy the new URL.

## Wire the site

1. Add GitHub Actions secret `VITE_FORMS_ENDPOINT` = that `/exec` URL.
2. For local builds, set the same value in `.env.local`.
3. Redeploy GitHub Pages (push to `main` or run the Pages workflow).

Do not commit the live `/exec` URL into the repo.
