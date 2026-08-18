import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Always publish at the domain root. GitHub Pages project URLs
// (/username.github.io/hackfarm/) will look unstyled until the custom
// domain (www.hackfarm.co.nz) is active — that is expected. Do not
// switch this to '/hackfarm/' or CSS/images break on the live domain.
export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
});
