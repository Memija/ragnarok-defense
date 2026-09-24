import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    target: 'esnext',
    cssMinify: true,
    sourcemap: false
  },
  server: {
    port: 5173,
    host: true
  }
});
