import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

process.env.VITE_SITE_ORIGIN = process.env.VITE_SITE_ORIGIN || 'https://hackfarm.co.nz';

function normalizeBase(raw?: string) {
  let base = (raw || '/').trim() || '/';
  if (!base.startsWith('/')) base = `/${base}`;
  if (!base.endsWith('/')) base = `${base}/`;
  return base;
}

export default defineConfig({
  plugins: [react()],
  base: normalizeBase(process.env.BASE_URL),
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
});
