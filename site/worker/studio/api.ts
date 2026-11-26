// Studio JSON API. Each route says who may call it; owners can do everything,
// staff only see their own shoots and colleagues' names and phones (no money).
import { currentUser, requireOwner, type AuthEnv, type User } from './auth';
import { ensureSchema } from './db';
import { HttpError, errorResponse, json, readBody, text } from './http';
import * as v from './validate';
import * as people from './repos/people';
import * as clients from './repos/clients';
import * as bookings from './repos/bookings';

export interface StudioEnv extends AuthEnv {
  ASSETS: Fetcher;
}

interface Ctx { request: Request; url: URL; env: StudioEnv; user: User; params: string[] }
type Handler = (ctx: Ctx) => Promise<unknown>;
interface Route { method: string; path: RegExp; owner: boolean; handler: Handler }

const route = (method: string, path: string, owner: boolean, handler: Handler): Route => ({
  method,
  path: new RegExp(`^/studio/api${path.replace(/:id/g, '(\\d+)')}$`),
  owner,
  handler,
});
const body = (ctx: Ctx) => readBody(ctx.request);
const pid = (ctx: Ctx, i = 0) => v.id(ctx.params[i]);

const routes: Route[] = [
  route('GET', '/me', false, async ({ user }) => user),

  route('GET', '/people', false, async ({ env, user }) =>
    user.access === 'owner' ? people.listPeople(env.DB) : people.listColleagues(env.DB)),
  route('POST', '/people', true, async (ctx) => people.createPerson(ctx.env.DB, await body(ctx))),
  route('PUT', '/people/:id', true, async (ctx) => people.updatePerson(ctx.env.DB, pid(ctx), await body(ctx), ctx.user.personId)),

  route('GET', '/clients', true, async ({ env }) => clients.listClients(env.DB)),
  route('POST', '/clients', true, async (ctx) => clients.createClient(ctx.env.DB, await body(ctx))),
  route('PUT', '/clients/:id', true, async (ctx) => clients.updateClient(ctx.env.DB, pid(ctx), await body(ctx))),

  route('GET', '/bookings', true, async ({ env }) => bookings.listBookings(env.DB)),
  route('POST', '/bookings', true, async (ctx) => bookings.createBooking(ctx.env.DB, await body(ctx))),
  route('GET', '/bookings/:id', true, async (ctx) => bookings.getBooking(ctx.env.DB, pid(ctx))),
  route('PUT', '/bookings/:id', true, async (ctx) => bookings.updateBooking(ctx.env.DB, pid(ctx), await body(ctx))),
  route('DELETE', '/bookings/:id', true, async (ctx) => { await bookings.deleteBooking(ctx.env.DB, pid(ctx)); return { ok: true }; }),
  route('POST', '/bookings/:id/events', true, async (ctx) => bookings.createEvent(ctx.env.DB, pid(ctx), await body(ctx))),
  route('PUT', '/events/:id', true, async (ctx) => bookings.updateEvent(ctx.env.DB, pid(ctx), await body(ctx))),
  route('DELETE', '/events/:id', true, async (ctx) => bookings.deleteEvent(ctx.env.DB, pid(ctx))),
  route('PUT', '/events/:id/crew', true, async (ctx) => bookings.setCrew(ctx.env.DB, pid(ctx), await body(ctx))),

  // Calendar: owners see every event, staff only the ones they are crew on.
  route('GET', '/events', false, async ({ env, url, user }) => {
    const range = { from: url.searchParams.get('from'), to: url.searchParams.get('to') };
    const from = v.date(range, 'from', { required: true })!;
    const to = v.date(range, 'to', { required: true })!;
    return bookings.listEvents(env.DB, from, to, user.access === 'owner' ? undefined : user.personId);
  }),
];

/** Writes must come from the dashboard itself: JSON plus a custom header, which other sites cannot send. */
function checkWrite(request: Request) {
  if (request.method === 'GET') return;
  if (request.headers.get('X-Studio') !== '1' || !(request.headers.get('Content-Type') || '').startsWith('application/json')) {
    throw new HttpError(403, 'Requests must come from the studio dashboard.');
  }
}

/** Everything under /studio: the API, and the dashboard pages (only for signed-in users). */
export async function handleStudio(request: Request, url: URL, env: StudioEnv): Promise<Response> {
  const isApi = url.pathname.startsWith('/studio/api/');
  try {
    if (!env.DB) throw new HttpError(503, 'Studio database is not connected yet.');
    await ensureSchema(env.DB);
    const user = await currentUser(request, url, env);
    if (!isApi) {
      const res = await env.ASSETS.fetch(request);
      const out = new Response(res.body, res);
      out.headers.set('Cache-Control', 'no-store');
      out.headers.set('X-Robots-Tag', 'noindex');
      return out;
    }
    checkWrite(request);
    for (const r of routes) {
      const m = url.pathname.match(r.path);
      if (!m || r.method !== request.method) continue;
      if (r.owner) requireOwner(user);
      return json(await r.handler({ request, url, env, user, params: m.slice(1) }));
    }
    throw new HttpError(404, 'Not found.');
  } catch (err) {
    if (isApi) return errorResponse(err);
    const status = err instanceof HttpError ? err.status : 500;
    return text(err instanceof HttpError ? err.message : 'Something went wrong.', status);
  }
}
