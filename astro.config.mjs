import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import node from '@astrojs/node';

export default defineConfig({
  output: 'static', // ✅ Wajib gunakan 'static'
  integrations: [react()],
  build: {
    format: 'directory', 
  },
  adapter: node({ mode: 'standalone' }),
  integrations: [react()],
});
