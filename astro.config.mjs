// @ts-check
import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import react from '@astrojs/react';
import remarkBreaks from 'remark-breaks';
import remarkObsidian from './src/markdown/remark-obsidian.mjs';
import remarkTermHints from './src/markdown/remark-term-hints.mjs';

const base = '/house-on-the-hill';

// https://astro.build/config
export default defineConfig({
  site: 'https://chepash.github.io',
  base,
  trailingSlash: 'always',
  integrations: [react()],
  markdown: {
    // remark rather than the default Sätteri: the notes need Obsidian callouts and
    // icon embeds, which are plain remark plugins here.
    processor: unified({
      // Obsidian shows single line breaks as breaks; remark-breaks must run after
      // remark-obsidian, which splits callout titles on the first line break.
      remarkPlugins: [[remarkObsidian, { base: `${base}/` }], remarkTermHints, remarkBreaks],
    }),
  },
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
