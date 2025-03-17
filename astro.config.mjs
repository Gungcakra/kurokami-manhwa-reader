import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import vercelServerless from '@astrojs/vercel/serverless';
export default defineConfig({
  output: 'server',
  adapter: vercelServerless(),
  integrations: [react()],
});
