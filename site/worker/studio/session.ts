// Signed session cookie for the studio. The cookie holds the signed-in email
// and an expiry, signed with HMAC-SHA256 and SESSION_SECRET, so it cannot be
// forged or edited. Access is still checked against the people table on every
// request, so making someone inactive locks them out at once.

export const SESSION_COOKIE = 'studio_session';
export const SESSION_DAYS = 14;

const enc = new TextEncoder();
const b64url = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
export const fromB64url = (s: string) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0));

async function hmac(secret: string, data: string): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return new Uint8Array(await crypto.subtle.sign('HMAC', key, enc.encode(data)));
}

/** Constant-time comparison, so the signature check does not leak timing. */
function same(a: Uint8Array, b: Uint8Array) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

export async function signSession(email: string, secret: string, now = Date.now()): Promise<string> {
  const payload = b64url(enc.encode(JSON.stringify({ email, exp: Math.floor(now / 1000) + SESSION_DAYS * 86400 })));
  return `${payload}.${b64url(await hmac(secret, payload))}`;
}

/** The email in a valid, unexpired session cookie value, or null. */
export async function verifySession(value: string, secret: string, now = Date.now()): Promise<string | null> {
  const [payload, sig] = value.split('.');
  if (!payload || !sig) return null;
  try {
    if (!same(fromB64url(sig), await hmac(secret, payload))) return null;
    const { email, exp } = JSON.parse(new TextDecoder().decode(fromB64url(payload)));
    if (typeof email !== 'string' || typeof exp !== 'number' || exp < now / 1000) return null;
    return email;
  } catch {
    return null;
  }
}

export function readCookie(request: Request, name: string): string {
  for (const part of (request.headers.get('Cookie') || '').split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === name) return v.join('=');
  }
  return '';
}

export const cookie = (name: string, value: string, path: string, maxAge: number) =>
  `${name}=${value}; Path=${path}; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=Lax`;
