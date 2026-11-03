import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Change `site` to the final domain before launch (used for sitemap + SEO tags).
export default defineConfig({
  site: 'https://vibeshotsnepal.com',
  integrations: [sitemap({ filter: (page) => !page.includes('/thank-you') })],
  devToolbar: { enabled: false },
});
