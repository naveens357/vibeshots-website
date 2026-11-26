// Cloudflare Worker for vibeshotsnepal.com.
// Serves the built Astro site (static assets) and routes the few dynamic
// paths to their handlers. To add a route, add it here and to
// "run_worker_first" in wrangler.jsonc.
import { startAuth, finishAuth } from './cms-auth.js';
import { handleStudio } from './studio/api.ts';

/** Exact paths -> handler(request, url, env). Trailing slashes are ignored. */
const routes = {
  '/auth': (request, url, env) => startAuth(url, env),
  '/callback': (request, url, env) => finishAuth(request, url, env),
};

/** Path prefixes -> handler: everything under them goes to the handler. */
const sections = [
  ['/studio', handleStudio],
];

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const handler = routes[url.pathname.replace(/(.)\/$/, '$1')];
    if (handler) return handler(request, url, env);
    const section = sections.find(([prefix]) => url.pathname === prefix || url.pathname.startsWith(`${prefix}/`));
    if (section) return section[1](request, url, env);
    return env.ASSETS.fetch(request);
  },
};
