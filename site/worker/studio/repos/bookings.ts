// Bookings (one per client job) and their events (haldi, wedding day, reception…)
// with the crew assigned to each event.
import { all, first, mustFind, run } from '../db';
import { HttpError } from '../http';
import * as v from '../validate';
import { ROLES, type Role } from './people';
import { createClient, getClient } from './clients';

export const KINDS = ['wedding', 'prewedding', 'commercial', 'other'] as const;
export const STATUSES = ['tentative', 'confirmed', 'completed', 'cancelled'] as const;

type BookingRow = {
  id: number; client_id: number; title: string; kind: string; package: string | null; side: string | null;
  total_price: number | null; discount: number | null; status: string; notes: string | null; created_at: string;
};
type EventRow = {
  id: number; booking_id: number; name: string; date: string; call_time: string | null; end_time: string | null;
  venue: string | null; map_url: string | null; notes: string | null;
};
type CrewRow = { event_id: number; person_id: number; role: Role; fee: number | null; name: string; phone: string | null };

/* ---------- bookings ---------- */

export const listBookings = (db: D1Database) => all<BookingRow & { client_name: string; client_phone: string | null; first_date: string | null; last_date: string | null; event_count: number }>(db,
  `SELECT b.*, c.name AS client_name, c.phone AS client_phone,
          MIN(e.date) AS first_date, MAX(e.date) AS last_date, COUNT(e.id) AS event_count
   FROM bookings b JOIN clients c ON c.id = b.client_id LEFT JOIN events e ON e.booking_id = b.id
   GROUP BY b.id ORDER BY first_date IS NULL, first_date DESC, b.id DESC`);

/** A booking with its client and events (each with crew). Fees included: owners only. */
export async function getBooking(db: D1Database, id: number) {
  const booking = await mustFind<BookingRow>(db, 'SELECT * FROM bookings WHERE id = ?', id);
  const events = await all<EventRow>(db, 'SELECT * FROM events WHERE booking_id = ? ORDER BY date, call_time', id);
  const crew = await crewFor(db, events.map((e) => e.id));
  return {
    ...booking,
    client: await getClient(db, booking.client_id),
    events: events.map((e) => ({ ...e, crew: crew.filter((c) => c.event_id === e.id) })),
  };
}

function parseBooking(body: Record<string, unknown>) {
  return {
    title: v.str(body, 'title', { required: true, max: 150 })!,
    kind: v.oneOf(body, 'kind', KINDS, 'wedding'),
    package: v.str(body, 'package', { max: 100 }),
    side: body.side ? v.oneOf(body, 'side', ['bride', 'groom', 'both'] as const) : null,
    total_price: v.int(body, 'total_price'),
    discount: v.int(body, 'discount'),
    status: v.oneOf(body, 'status', STATUSES, 'confirmed'),
    notes: v.str(body, 'notes', { max: 4000 }),
  };
}

/** Creates a booking for an existing client (client_id) or a new one (client: {...}). */
export async function createBooking(db: D1Database, body: Record<string, unknown>) {
  const b = parseBooking(body);
  let clientId = v.int(body, 'client_id');
  if (clientId) await getClient(db, clientId);
  else if (body.client && typeof body.client === 'object') clientId = (await createClient(db, body.client as Record<string, unknown>)).id;
  else throw new HttpError(400, 'client: choose a client or add a new one');
  const res = await run(db,
    'INSERT INTO bookings (client_id, title, kind, package, side, total_price, discount, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    clientId, b.title, b.kind, b.package, b.side, b.total_price, b.discount, b.status, b.notes);
  return getBooking(db, Number(res.meta.last_row_id));
}

export async function updateBooking(db: D1Database, id: number, body: Record<string, unknown>) {
  await mustFind(db, 'SELECT id FROM bookings WHERE id = ?', id);
  const b = parseBooking(body);
  await run(db,
    'UPDATE bookings SET title = ?, kind = ?, package = ?, side = ?, total_price = ?, discount = ?, status = ?, notes = ? WHERE id = ?',
    b.title, b.kind, b.package, b.side, b.total_price, b.discount, b.status, b.notes, id);
  return getBooking(db, id);
}

export async function deleteBooking(db: D1Database, id: number) {
  await mustFind(db, 'SELECT id FROM bookings WHERE id = ?', id);
  await db.batch([
    db.prepare('DELETE FROM event_crew WHERE event_id IN (SELECT id FROM events WHERE booking_id = ?)').bind(id),
    db.prepare('DELETE FROM events WHERE booking_id = ?').bind(id),
    db.prepare('DELETE FROM bookings WHERE id = ?').bind(id),
  ]);
}

/* ---------- events ---------- */

function parseEvent(body: Record<string, unknown>) {
  return {
    name: v.str(body, 'name', { required: true, max: 100 })!,
    date: v.date(body, 'date', { required: true })!,
    call_time: v.time(body, 'call_time'),
    end_time: v.time(body, 'end_time'),
    venue: v.str(body, 'venue', { max: 300 }),
    map_url: v.str(body, 'map_url', { max: 500 }),
    notes: v.str(body, 'notes', { max: 2000 }),
  };
}

export async function createEvent(db: D1Database, bookingId: number, body: Record<string, unknown>) {
  await mustFind(db, 'SELECT id FROM bookings WHERE id = ?', bookingId);
  const e = parseEvent(body);
  await run(db, 'INSERT INTO events (booking_id, name, date, call_time, end_time, venue, map_url, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    bookingId, e.name, e.date, e.call_time, e.end_time, e.venue, e.map_url, e.notes);
  return getBooking(db, bookingId);
}

const bookingOfEvent = async (db: D1Database, eventId: number) =>
  (await mustFind<{ booking_id: number }>(db, 'SELECT booking_id FROM events WHERE id = ?', eventId)).booking_id;

export async function updateEvent(db: D1Database, id: number, body: Record<string, unknown>) {
  const bookingId = await bookingOfEvent(db, id);
  const e = parseEvent(body);
  await run(db, 'UPDATE events SET name = ?, date = ?, call_time = ?, end_time = ?, venue = ?, map_url = ?, notes = ? WHERE id = ?',
    e.name, e.date, e.call_time, e.end_time, e.venue, e.map_url, e.notes, id);
  return getBooking(db, bookingId);
}

export async function deleteEvent(db: D1Database, id: number) {
  const bookingId = await bookingOfEvent(db, id);
  await db.batch([
    db.prepare('DELETE FROM event_crew WHERE event_id = ?').bind(id),
    db.prepare('DELETE FROM events WHERE id = ?').bind(id),
  ]);
  return getBooking(db, bookingId);
}

/** Replaces an event's crew. A missing fee falls back to the person's per-event rate. */
export async function setCrew(db: D1Database, eventId: number, body: Record<string, unknown>) {
  const bookingId = await bookingOfEvent(db, eventId);
  if (!Array.isArray(body.crew)) throw new HttpError(400, 'crew: must be a list');
  const crew = body.crew.map((c: Record<string, unknown>) => ({
    person_id: v.int(c, 'person_id', { required: true, min: 1 })!,
    role: v.oneOf(c, 'role', ROLES),
    fee: v.int(c, 'fee'),
  }));
  const stmts = [db.prepare('DELETE FROM event_crew WHERE event_id = ?').bind(eventId)];
  for (const c of crew) {
    const person = await first<{ pay_type: string; event_rate: number | null; active: number }>(db, 'SELECT pay_type, event_rate, active FROM people WHERE id = ?', c.person_id);
    if (!person || !person.active) throw new HttpError(400, 'crew: unknown or inactive person');
    const fee = c.fee ?? (person.pay_type === 'salary' ? null : person.event_rate);
    stmts.push(db.prepare('INSERT OR REPLACE INTO event_crew (event_id, person_id, role, fee) VALUES (?, ?, ?, ?)').bind(eventId, c.person_id, c.role, fee));
  }
  await db.batch(stmts);
  return getBooking(db, bookingId);
}

const crewFor = (db: D1Database, eventIds: number[]) => eventIds.length
  ? all<CrewRow>(db,
    `SELECT ec.event_id, ec.person_id, ec.role, ec.fee, p.name, p.phone
     FROM event_crew ec JOIN people p ON p.id = ec.person_id
     WHERE ec.event_id IN (SELECT value FROM json_each(?)) ORDER BY p.name`, JSON.stringify(eventIds))
  : Promise.resolve([] as CrewRow[]);

/* ---------- calendar ---------- */

/**
 * Events between two AD dates with booking, client and crew (no money).
 * With `personId`, only events that person is crew on.
 */
export async function listEvents(db: D1Database, from: string, to: string, personId?: number) {
  const rows = await all<EventRow & { title: string; kind: string; status: string; package: string | null; client_name: string; client_phone: string | null }>(db,
    `SELECT e.*, b.title, b.kind, b.status, b.package, c.name AS client_name, c.phone AS client_phone
     FROM events e JOIN bookings b ON b.id = e.booking_id JOIN clients c ON c.id = b.client_id
     WHERE e.date BETWEEN ? AND ? AND b.status != 'cancelled'
       ${personId ? 'AND e.id IN (SELECT event_id FROM event_crew WHERE person_id = ?)' : ''}
     ORDER BY e.date, e.call_time`,
    ...(personId ? [from, to, personId] : [from, to]));
  const crew = await crewFor(db, rows.map((r) => r.id));
  return rows.map((r) => ({
    ...r,
    crew: crew.filter((c) => c.event_id === r.id).map(({ fee: _fee, ...c }) => c),
  }));
}
