// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import sitemap from '@astrojs/sitemap';
import { EnumChangefreq } from 'sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://cngxjs.github.io/compodocx-website',
  base: '/compodocx-website',
  trailingSlash: 'always',
  devToolbar: { enabled: false },

  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [
    sitemap({
      changefreq: EnumChangefreq.WEEKLY,
      priority: 0.7,
      lastmod: new Date(),
      serialize(item) {
        if (item.url.endsWith('/compodocx-website/')) {
          item.priority = 1.0;
          item.changefreq = EnumChangefreq.WEEKLY;
        } else if (item.url.endsWith('/guides/')) {
          item.priority = 0.9;
          item.changefreq = EnumChangefreq.WEEKLY;
        } else if (item.url.includes('/guides/')) {
          item.priority = 0.7;
          item.changefreq = EnumChangefreq.MONTHLY;
        }
        return item;
      },
    }),
  ],
});
