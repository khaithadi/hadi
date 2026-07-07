import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base: './' so the production build works when served from any static host / subpath.
export default defineConfig({
  base: './',
  plugins: [react()],
});
