import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import VueRouter from 'vue-router/vite';
import Vue from '@vitejs/plugin-vue';

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@modules': fileURLToPath(new URL('./src/modules', import.meta.url)),
    },
  },
  plugins: [
    VueRouter({
      routesFolder: [
        { src: 'src/pages' },
        { src: 'src/modules/devices/ui/pages', path: 'devices/' },
        { src: 'src/modules/beneficiary/ui/pages', path: 'beneficiary/' },
      ],
    }),
    // Vue() must come after VueRouter() so it can pick up the generated routes.
    Vue(),
  ],
});
