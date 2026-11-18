import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import { loadEnv } from 'vite';

// Static build for PHP-only hosting (Hostinger shared hosting): `astro build`
// writes plain files to dist/, the login session API runs as PHP from
// public/api/, and public/.htaccess maps /manhwa/<id> and /chapter/<id> onto
// their `_` shells. SITE_URL (.env) is used for canonical / Open Graph URLs.
const env = loadEnv(process.env.NODE_ENV ?? 'production', process.cwd(), '');
const site = (process.env.SITE_URL || env.SITE_URL || '').trim() || undefined;
if (!site) console.warn('[kurokami] SITE_URL is not set — canonical/og URLs will use localhost');

export default defineConfig({
  site,
  output: 'static',
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
  },
});
