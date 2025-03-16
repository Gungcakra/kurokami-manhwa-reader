import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import node from '@astrojs/node';

export default defineConfig({
  output: 'server', // Pastikan output adalah server
  adapter: node({ mode: 'standalone' }), // Tambahkan mode
  integrations: [react()],
});
