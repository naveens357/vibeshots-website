// Cloudflare Worker for vibeshotsnepal.com.
// Serves the built Astro site (static assets) and routes the few dynamic
// paths to their handlers. To add a route, add it here and to
// "run_worker_first" in wrangler.jsonc.
import { startAuth, finishAuth } from './cms-auth.js';

/** path -> handler(request, url, env). Trailing slashes are ignored. */
const routes = {
  '/auth': (request, url, env) => startAuth(url, env),
  '/callback': (request, url, env) => finishAuth(request, url, env),
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const handler = routes[url.pathname.replace(/(.)\/$/, '$1')];
    return handler ? handler(request, url, env) : env.ASSETS.fetch(request);
  },
};
