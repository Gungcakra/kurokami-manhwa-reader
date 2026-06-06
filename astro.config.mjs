import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import vercelServerless from '@astrojs/vercel/serverless';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  output: 'server',
  adapter: vercelServerless(),
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
  },
});
