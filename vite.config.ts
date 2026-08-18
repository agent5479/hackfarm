import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

function normalizeBase(raw?: string) {
  let base = (raw || '/hackfarm/').trim() || '/hackfarm/';
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
