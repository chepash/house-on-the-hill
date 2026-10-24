// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  site: 'https://chepash.github.io',
  base: '/house-on-the-hill',
  trailingSlash: 'always',
  integrations: [react()],
  i18n: {
    locales: ['en', 'ru'],
    defaultLocale: 'en',
    routing: {
      prefixDefaultLocale: true,
      // The root page picks the language itself (saved choice, then browser language).
      redirectToDefaultLocale: false,
    },
  },
});
