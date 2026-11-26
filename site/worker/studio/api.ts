// Studio JSON API. Each route says who may call it; owners can do everything,
// staff only see their own shoots and colleagues' names and phones (no money).
import { currentUser, requireOwner, userFor, type AuthEnv, type User } from './auth';
import { finishLogin, logout, signedIn, startLogin } from './google';
import { ensureSchema } from './db';
import { HttpError, errorResponse, json, readBody } from './http';
import * as v from './validate';
import * as people from './repos/people';
import * as clients from './repos/clients';
import * as bookings from './repos/bookings';
import * as finance from './repos/finance';

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

  // Money (owners). Client payments and shoot expenses return the updated booking.
  route('POST', '/bookings/:id/payments', true, async (ctx) =>
    bookings.getBooking(ctx.env.DB, await finance.addPayment(ctx.env.DB, pid(ctx), await body(ctx)))),
  route('DELETE', '/payments/:id', true, async (ctx) => bookings.getBooking(ctx.env.DB, await finance.deletePayment(ctx.env.DB, pid(ctx)))),
  route('POST', '/expenses', true, async (ctx) => {
    const bookingId = await finance.addExpense(ctx.env.DB, await body(ctx));
    return bookingId ? bookings.getBooking(ctx.env.DB, bookingId) : { ok: true };
  }),
  route('DELETE', '/expenses/:id', true, async (ctx) => {
    const bookingId = await finance.deleteExpense(ctx.env.DB, pid(ctx));
    return bookingId ? bookings.getBooking(ctx.env.DB, bookingId) : { ok: true };
  }),
  route('GET', '/studio-costs', true, async ({ env }) => finance.listStudioCosts(env.DB)),
  route('POST', '/studio-costs', true, async (ctx) => finance.saveStudioCost(ctx.env.DB, null, await body(ctx))),
  route('PUT', '/studio-costs/:id', true, async (ctx) => finance.saveStudioCost(ctx.env.DB, pid(ctx), await body(ctx))),
  route('POST', '/staff-payments', true, async (ctx) => { await finance.addStaffPayment(ctx.env.DB, await body(ctx)); return finance.payData(ctx.env.DB); }),
  route('DELETE', '/staff-payments/:id', true, async (ctx) => { await finance.deleteStaffPayment(ctx.env.DB, pid(ctx)); return finance.payData(ctx.env.DB); }),
  route('GET', '/finance', true, async ({ env, url }) => {
    const range = { from: url.searchParams.get('from'), to: url.searchParams.get('to') };
    return finance.financeData(env.DB, v.date(range, 'from', { required: true })!, v.date(range, 'to', { required: true })!);
  }),
  route('GET', '/outstanding', true, async ({ env }) => finance.outstanding(env.DB)),
  // Team pay: owners see everyone, staff only their own.
  route('GET', '/pay', false, async ({ env, user }) => finance.payData(env.DB, user.access === 'owner' ? undefined : user.personId)),

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

/** Sign-in pages: Google login, its callback and logout. */
const signIn: Record<string, (request: Request, url: URL, env: StudioEnv) => Promise<Response> | Response> = {
  '/studio/login': (_, url, env) => startLogin(url, env),
  '/studio/logout': () => logout(),
  '/studio/oauth/callback': async (request, url, env) => {
    const email = await finishLogin(request, url, env);
    await userFor(email, env); // only team members get a session
    return signedIn(email, env);
  },
};

/** Plain page for sign-in problems, with a way to try another Google account. */
const problemPage = (message: string, status: number) => new Response(
  `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><title>Vibeshots Studio</title>
<style>body{font:16px/1.5 system-ui,sans-serif;background:#F3EEE6;color:#1B1714;display:grid;place-items:center;min-height:100vh;margin:0}main{max-width:440px;padding:24px;text-align:center}a{display:inline-block;margin-top:12px;background:#8E1B1B;color:#fff;padding:10px 18px;border-radius:999px;text-decoration:none}</style></head>
<body><main><h1>Vibeshots Studio</h1><p>${message.replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`)}</p><a href="/studio/logout">Sign in with another Google account</a></main></body></html>`,
  { status, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' } },
);

/** Everything under /studio: sign-in, the API, and the dashboard pages (only for signed-in users). */
export async function handleStudio(request: Request, url: URL, env: StudioEnv): Promise<Response> {
  const isApi = url.pathname.startsWith('/studio/api/');
  const signInPage = signIn[url.pathname.replace(/\/$/, '')];
  try {
    if (!env.DB) throw new HttpError(503, 'Studio database is not connected yet.');
    await ensureSchema(env.DB);
    if (signInPage) return await signInPage(request, url, env);
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
    if (status === 401 && !signInPage) return Response.redirect(`${url.origin}/studio/login`, 302);
    if (status === 500) console.error(err);
    return problemPage(err instanceof HttpError ? err.message : 'Something went wrong. Try again.', status);
  }
}
