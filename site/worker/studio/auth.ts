// Who is asking? People sign in with Google (google.ts) and get a signed
// session cookie (session.ts). Every request then checks that the email still
// belongs to an active owner or staff member in the people table.
//
// Settings: OWNER_EMAILS (comma-separated emails that are always owners),
// plus the Google and session settings in google.ts.
// Local development only (site/.dev.vars, never deployed):
//   STUDIO_DEV_EMAIL  acts as this user when the host is localhost
import { HttpError } from './http';
import { first, run } from './db';
import type { GoogleEnv } from './google';
import { SESSION_COOKIE, readCookie, verifySession } from './session';

export type Access = 'owner' | 'staff';
export interface User {
  personId: number;
  name: string;
  email: string;
  access: Access;
}

export interface AuthEnv extends GoogleEnv {
  DB: D1Database;
  OWNER_EMAILS?: string;
  STUDIO_DEV_EMAIL?: string;
}

const isLocal = (url: URL) => ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
const ownerEmails = (env: AuthEnv) => (env.OWNER_EMAILS || '').split(',').map((e) => e.trim().toLowerCase()).filter(Boolean);

/** The email of the signed-in person, or a 401. */
async function signedInEmail(request: Request, url: URL, env: AuthEnv): Promise<string> {
  if (isLocal(url) && env.STUDIO_DEV_EMAIL) return env.STUDIO_DEV_EMAIL.toLowerCase();
  if (!env.SESSION_SECRET) throw new HttpError(503, 'Studio login is not set up yet.');
  const email = await verifySession(readCookie(request, SESSION_COOKIE), env.SESSION_SECRET);
  if (!email) throw new HttpError(401, 'Please sign in.');
  return email;
}

/** Owner or staff record for an email; owners in OWNER_EMAILS are added or restored automatically. */
export async function userFor(email: string, env: AuthEnv): Promise<User> {
  type Row = { id: number; name: string; email: string; access: string; active: number };
  const find = () => first<Row>(env.DB, 'SELECT id, name, email, access, active FROM people WHERE email = ?', email);
  let person = await find();
  if (ownerEmails(env).includes(email) && (!person || person.access !== 'owner' || !person.active)) {
    if (person) await run(env.DB, "UPDATE people SET access = 'owner', active = 1 WHERE id = ?", person.id);
    else await run(env.DB, "INSERT INTO people (name, email, access) VALUES (?, ?, 'owner')", email.split('@')[0], email);
    person = await find();
  }
  if (!person || !person.active || (person.access !== 'owner' && person.access !== 'staff')) {
    throw new HttpError(403, `${email} has no access to the studio. Ask an owner to add you on the People page.`);
  }
  return { personId: person.id, name: person.name, email, access: person.access };
}

/** The signed-in studio user, or a 401/403. */
export async function currentUser(request: Request, url: URL, env: AuthEnv): Promise<User> {
  return userFor(await signedInEmail(request, url, env), env);
}

export function requireOwner(user: User) {
  if (user.access !== 'owner') throw new HttpError(403, 'Only owners can do this.');
}
