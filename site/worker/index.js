// Cloudflare Worker for vibeshotsnepal.com.
// Serves the built Astro site (static assets) and adds the two routes the
// content manager (Decap CMS at /admin) needs to sign in with GitHub:
//   /auth      starts GitHub sign-in in the CMS pop-up
//   /callback  GitHub sends the user back here; we swap the code for a token
//              and hand it to the CMS window that opened the pop-up.
// Secrets (Cloudflare → Worker → Settings → Variables and Secrets):
//   GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET  (from a GitHub OAuth App)

const STATE_COOKIE = 'cms_oauth_state';
const SCOPE = 'public_repo';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/auth' || url.pathname === '/auth/') return startAuth(url, env);
    if (url.pathname === '/callback' || url.pathname === '/callback/') return finishAuth(request, url, env);
    return env.ASSETS.fetch(request);
  },
};

function startAuth(url, env) {
  if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET) {
    return text('Sign-in is not set up yet: add GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET to the Worker.', 500);
  }
  const state = randomState();
  const gh = new URL('https://github.com/login/oauth/authorize');
  gh.searchParams.set('client_id', env.GITHUB_CLIENT_ID);
  gh.searchParams.set('redirect_uri', `${url.origin}/callback`);
  gh.searchParams.set('scope', SCOPE);
  gh.searchParams.set('state', state);
  return new Response(null, {
    status: 302,
    headers: {
      Location: gh.toString(),
      'Set-Cookie': `${STATE_COOKIE}=${state}; Path=/callback; Max-Age=600; HttpOnly; Secure; SameSite=Lax`,
      'Cache-Control': 'no-store',
    },
  });
}

async function finishAuth(request, url, env) {
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const cookieState = readCookie(request.headers.get('Cookie') || '', STATE_COOKIE);
  if (!code || !state || !cookieState || state !== cookieState) {
    return reply(url.origin, 'error', { message: 'Sign-in expired or was not started here. Close this window and try again.' });
  }
  let data;
  try {
    const res = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json', 'User-Agent': 'vibeshots-cms-auth' },
      body: JSON.stringify({
        client_id: env.GITHUB_CLIENT_ID,
        client_secret: env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: `${url.origin}/callback`,
      }),
    });
    data = await res.json();
  } catch {
    return reply(url.origin, 'error', { message: 'Could not reach GitHub. Try again.' });
  }
  if (!data || !data.access_token) {
    return reply(url.origin, 'error', { message: (data && data.error_description) || 'GitHub did not return a token.' });
  }
  return reply(url.origin, 'success', { token: data.access_token, provider: 'github' });
}

// Decap CMS handshake: the pop-up says "authorizing:github"; the CMS window
// answers; we then send the result, but only to a window on this site's origin.
function reply(origin, status, content) {
  const message = `authorization:github:${status}:${JSON.stringify(content)}`;
  const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="robots" content="noindex"><title>Signing in…</title></head>
<body><p>${status === 'success' ? 'Signed in. You can close this window.' : escapeHtml(content.message)}</p>
<script>
(function () {
  var origin = ${safeJson(origin)};
  var message = ${safeJson(message)};
  if (!window.opener) return;
  window.addEventListener('message', function (e) {
    if (e.origin !== origin) return;
    window.opener.postMessage(message, origin);
  }, false);
  window.opener.postMessage('authorizing:github', origin);
})();
</script></body></html>`;
  return new Response(html, {
    status: status === 'success' ? 200 : 400,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'Set-Cookie': `${STATE_COOKIE}=; Path=/callback; Max-Age=0; HttpOnly; Secure; SameSite=Lax`,
      'Referrer-Policy': 'no-referrer',
    },
  });
}

// JSON for inline <script>: escape < so text from GitHub cannot close the tag.
function safeJson(v) {
  return JSON.stringify(v).replace(/</g, String.fromCharCode(92) + 'u003c');
}

function randomState() {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

function readCookie(header, name) {
  for (const part of header.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === name) return v.join('=');
  }
  return '';
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}

function text(body, status) {
  return new Response(body, { status, headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' } });
}
