import type { APIRoute } from 'astro';

// Generated so the sitemap URL follows the site + base path of each deploy.
export const GET: APIRoute = ({ site }) => {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const sitemap = new URL(`${base}/sitemap-index.xml`, site);
  return new Response(
    `User-agent: *\nAllow: /\nDisallow: ${base}/admin/\nDisallow: ${base}/thank-you/\n\nSitemap: ${sitemap}\n`,
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );
};
