// Who is asking? Cloudflare Access puts a signed token (JWT) on every request
// to /studio after the email-code login. We verify that token ourselves, so the
// studio stays locked even if the Access rule is ever removed or the Worker is
// reached through another hostname. No token, no entry.
//
// Settings (Worker → Settings → Variables and Secrets):
//   ACCESS_TEAM_DOMAIN  e.g. vibeshots.cloudflareaccess.com
//   ACCESS_AUD          the Access application's "Application Audience (AUD) Tag"
//   OWNER_EMAILS        comma-separated emails that are always owners
// Local development only (in .dev.vars, never deployed):
//   STUDIO_DEV_EMAIL    acts as this user when the host is localhost
import { HttpError } from './http';
import { first, run } from './db';

export type Access = 'owner' | 'staff';
export interface User {
  personId: number;
  name: string;
  email: string;
  access: Access;
}

export interface AuthEnv {
  DB: D1Database;
  ACCESS_TEAM_DOMAIN?: string;
  ACCESS_AUD?: string;
  OWNER_EMAILS?: string;
  STUDIO_DEV_EMAIL?: string;
}

type Jwk = JsonWebKey & { kid: string };
let jwks: { keys: Jwk[]; fetchedAt: number } | null = null;

async function signingKey(teamDomain: string, kid: string): Promise<CryptoKey> {
  const fresh = jwks && Date.now() - jwks.fetchedAt < 60 * 60 * 1000 && jwks.keys.some((k) => k.kid === kid);
  if (!fresh) {
    const res = await fetch(`https://${teamDomain}/cdn-cgi/access/certs`);
    if (!res.ok) throw new HttpError(503, 'Could not reach the login service. Try again.');
    jwks = { keys: ((await res.json()) as { keys: Jwk[] }).keys, fetchedAt: Date.now() };
  }
  const jwk = jwks!.keys.find((k) => k.kid === kid);
  if (!jwk) throw new HttpError(401, 'Login expired. Reload the page to sign in again.');
  return crypto.subtle.importKey('jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
}

const b64url = (s: string) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0));
const decodePart = (s: string) => JSON.parse(new TextDecoder().decode(b64url(s)));

/** Verifies a Cloudflare Access JWT and returns the signed-in email. */
export async function verifyAccessJwt(token: string, teamDomain: string, aud: string): Promise<string> {
  const parts = token.split('.');
  if (parts.length !== 3) throw new HttpError(401, 'Not signed in.');
  const [h, p, sig] = parts;
  let header: { alg?: string; kid?: string };
  let payload: { aud?: string | string[]; exp?: number; nbf?: number; iss?: string; email?: string };
  try {
    header = decodePart(h);
    payload = decodePart(p);
  } catch {
    throw new HttpError(401, 'Not signed in.');
  }
  if (header.alg !== 'RS256' || !header.kid) throw new HttpError(401, 'Not signed in.');
  const key = await signingKey(teamDomain, header.kid);
  const ok = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, b64url(sig), new TextEncoder().encode(`${h}.${p}`));
  const now = Date.now() / 1000;
  const auds = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
  if (!ok || !auds.includes(aud) || !payload.exp || payload.exp < now || (payload.nbf && payload.nbf > now + 60)
    || payload.iss !== `https://${teamDomain}` || !payload.email) {
    throw new HttpError(401, 'Login expired. Reload the page to sign in again.');
  }
  return payload.email.toLowerCase();
}

const isLocal = (url: URL) => ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
const ownerEmails = (env: AuthEnv) => (env.OWNER_EMAILS || '').split(',').map((e) => e.trim().toLowerCase()).filter(Boolean);

/** The signed-in studio user, or a 401/403. */
export async function currentUser(request: Request, url: URL, env: AuthEnv): Promise<User> {
  let email: string;
  if (isLocal(url) && env.STUDIO_DEV_EMAIL) {
    email = env.STUDIO_DEV_EMAIL.toLowerCase();
  } else {
    if (!env.ACCESS_TEAM_DOMAIN || !env.ACCESS_AUD) throw new HttpError(503, 'Studio login is not set up yet.');
    const token = request.headers.get('Cf-Access-Jwt-Assertion') || '';
    email = await verifyAccessJwt(token, env.ACCESS_TEAM_DOMAIN, env.ACCESS_AUD);
  }

  type Row = { id: number; name: string; email: string; access: string; active: number };
  let person = await first<Row>(env.DB, 'SELECT id, name, email, access, active FROM people WHERE email = ?', email);
  const isOwner = ownerEmails(env).includes(email);
  if (isOwner && (!person || person.access !== 'owner' || !person.active)) {
    // owners listed in OWNER_EMAILS always get in, even before anyone added them
    if (person) await run(env.DB, "UPDATE people SET access = 'owner', active = 1 WHERE id = ?", person.id);
    else await run(env.DB, "INSERT INTO people (name, email, access) VALUES (?, ?, 'owner')", email.split('@')[0], email);
    person = await first<Row>(env.DB, 'SELECT id, name, email, access, active FROM people WHERE email = ?', email);
  }
  if (!person || !person.active || (person.access !== 'owner' && person.access !== 'staff')) {
    throw new HttpError(403, `${email} has no access to the studio. Ask an owner to add you.`);
  }
  return { personId: person.id, name: person.name, email, access: person.access };
}

export function requireOwner(user: User) {
  if (user.access !== 'owner') throw new HttpError(403, 'Only owners can do this.');
}
