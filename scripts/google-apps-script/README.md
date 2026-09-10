# Google Apps Script form backend

Sends Hack Farm website form submissions to `baerbelhack@gmail.com`.

## Deploy

1. Open [script.google.com](https://script.google.com) while logged into **baerbelhack@gmail.com**.
2. New project → paste [`Code.gs`](./Code.gs) (replace the default file).
3. **Deploy** → **New deployment** → type **Web app**.
4. Execute as: **Me**. Who has access: **Anyone**.
5. Authorize Gmail when prompted.
6. Copy the Web app URL ending in `/exec`.

## Wire the site

1. Add GitHub Actions secret `VITE_FORMS_ENDPOINT` = that `/exec` URL.
2. For local builds, set the same value in `.env.local`.
3. Redeploy GitHub Pages (push to `main` or run the Pages workflow).

Do not commit the live `/exec` URL into the repo.
