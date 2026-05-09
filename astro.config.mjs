// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import sitemap from '@astrojs/sitemap';
import { EnumChangefreq } from 'sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://compodocx.dev',
  base: '/',
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
        const path = new URL(item.url).pathname;
        if (path === '/') {
          item.priority = 1.0;
          item.changefreq = EnumChangefreq.WEEKLY;
        } else if (path === '/guides/') {
          item.priority = 0.9;
          item.changefreq = EnumChangefreq.WEEKLY;
        } else if (path.startsWith('/guides/')) {
          item.priority = 0.7;
          item.changefreq = EnumChangefreq.MONTHLY;
        }
        return item;
      },
    }),
  ],
});
