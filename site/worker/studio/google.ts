// "Sign in with Google" for the studio (OpenID Connect, authorization code flow).
//   /studio/login           sends the browser to Google
//   /studio/oauth/callback  Google sends it back; we check the result and set the session cookie
//   /studio/logout          clears the session
// Settings (Worker → Settings → Variables and Secrets):
//   GOOGLE_CLIENT_ID (variable), GOOGLE_CLIENT_SECRET (secret), SESSION_SECRET (secret)
import { HttpError } from './http';
import { SESSION_COOKIE, SESSION_DAYS, cookie, fromB64url, readCookie, signSession } from './session';

export interface GoogleEnv {
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  SESSION_SECRET?: string;
}

const STATE_COOKIE = 'studio_oauth_state';
const CALLBACK = '/studio/oauth/callback';

export function configured(env: GoogleEnv): env is Required<GoogleEnv> {
  return !!(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET && env.SESSION_SECRET && env.SESSION_SECRET.length >= 32);
}

const redirect = (location: string, cookies: string[] = []) => {
  const headers = new Headers({ Location: location, 'Cache-Control': 'no-store' });
  for (const c of cookies) headers.append('Set-Cookie', c);
  return new Response(null, { status: 302, headers });
};

const randomHex = (bytes: number) => Array.from(crypto.getRandomValues(new Uint8Array(bytes)), (b) => b.toString(16).padStart(2, '0')).join('');

export function startLogin(url: URL, env: GoogleEnv): Response {
  if (!configured(env)) throw new HttpError(503, 'Studio login is not set up yet.');
  const state = randomHex(24);
  const google = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  google.searchParams.set('client_id', env.GOOGLE_CLIENT_ID!);
  google.searchParams.set('redirect_uri', `${url.origin}${CALLBACK}`);
  google.searchParams.set('response_type', 'code');
  google.searchParams.set('scope', 'openid email profile');
  google.searchParams.set('state', state);
  google.searchParams.set('prompt', 'select_account');
  return redirect(google.toString(), [cookie(STATE_COOKIE, state, CALLBACK, 600)]);
}

/** Checks Google's answer and returns the verified email (lower case). */
export async function finishLogin(request: Request, url: URL, env: GoogleEnv): Promise<string> {
  if (!configured(env)) throw new HttpError(503, 'Studio login is not set up yet.');
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  if (!code || !state || state !== readCookie(request, STATE_COOKIE)) {
    throw new HttpError(400, 'Sign-in expired or was not started here. Go back to /studio and try again.');
  }
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: env.GOOGLE_CLIENT_ID!,
      client_secret: env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: `${url.origin}${CALLBACK}`,
      grant_type: 'authorization_code',
    }),
  });
  const data = (await res.json().catch(() => ({}))) as { id_token?: string };
  if (!res.ok || !data.id_token) throw new HttpError(401, 'Google did not confirm the sign-in. Try again.');
  // The ID token came straight from Google's token endpoint over HTTPS, so its
  // claims can be trusted without re-checking the signature (OpenID Connect 3.1.3.7).
  const claims = JSON.parse(new TextDecoder().decode(fromB64url(data.id_token.split('.')[1]))) as {
    aud?: string; iss?: string; exp?: number; email?: string; email_verified?: boolean;
  };
  if (claims.aud !== env.GOOGLE_CLIENT_ID || !['https://accounts.google.com', 'accounts.google.com'].includes(claims.iss || '')
    || !claims.exp || claims.exp < Date.now() / 1000 || !claims.email || claims.email_verified !== true) {
    throw new HttpError(401, 'Google did not confirm this email address.');
  }
  return claims.email.toLowerCase();
}

/** After a successful sign-in: set the session and go to the dashboard. */
export async function signedIn(email: string, env: GoogleEnv): Promise<Response> {
  const session = await signSession(email, env.SESSION_SECRET!);
  return redirect('/studio/', [
    cookie(SESSION_COOKIE, session, '/studio', SESSION_DAYS * 86400),
    cookie(STATE_COOKIE, '', CALLBACK, 0),
  ]);
}

export const logout = () => redirect('/studio/login', [cookie(SESSION_COOKIE, '', '/studio', 0)]);
