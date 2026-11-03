import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// SITE_URL / SITE_BASE are set by the GitHub Pages workflow
// (https://naveens357.github.io + /vibeshots-website). Locally, and on a custom
// domain, the site is served from the root.
const site = process.env.SITE_URL || 'https://vibeshotsnepal.com';
const base = (process.env.SITE_BASE || '/').replace(/\/$/, '') || '/';

/** Prefixes root-relative links in the built HTML with the base path, so
 *  pages, content and CMS uploads can keep plain "/path" links. */
function baseLinks() {
  return {
    name: 'base-links',
    hooks: {
      'astro:build:done': async ({ dir }) => {
        if (base === '/') return;
        const root = fileURLToPath(dir);
        const attr = /(\s(?:href|src|action|poster|data-thanks)=")\/(?!\/)/g;
        const walk = async (d) => {
          for (const e of await fs.readdir(d, { withFileTypes: true })) {
            const p = path.join(d, e.name);
            if (e.isDirectory()) await walk(p);
            else if (e.name.endsWith('.html')) {
              const html = await fs.readFile(p, 'utf8');
              const out = html.replace(attr, (m, pre, offset) =>
                html.startsWith(`${base}/`, offset + pre.length) ? m : `${pre}${base}/`);
              if (out !== html) await fs.writeFile(p, out);
            }
          }
        };
        await walk(root);
      },
    },
  };
}

export default defineConfig({
  site,
  base,
  integrations: [sitemap({ filter: (page) => !page.includes('/thank-you') }), baseLinks()],
  devToolbar: { enabled: false },
});
