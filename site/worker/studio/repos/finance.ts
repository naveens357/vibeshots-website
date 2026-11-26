// Money: client payments, expenses (per booking or for the studio), staff
// payments and monthly studio costs. Totals per BS month are worked out in the
// dashboard (src/studio/lib/finance.ts); this file stores and lists the rows.
import { all, mustFind, run } from '../db';
import { HttpError } from '../http';
import * as v from '../validate';

export const METHODS = ['cash', 'esewa', 'khalti', 'fonepay', 'bank', 'cheque', 'other'] as const;
export const EXPENSE_CATEGORIES = ['travel', 'food', 'hotel', 'permit', 'printing', 'storage', 'equipment', 'rent', 'utilities', 'software', 'marketing', 'other'] as const;
export const STAFF_PAY_KINDS = ['salary', 'event', 'advance', 'bonus'] as const;

const booking = (db: D1Database, id: number) => mustFind(db, 'SELECT id FROM bookings WHERE id = ?', id);

/* ---------- client payments ---------- */

export const paymentsFor = (db: D1Database, bookingId: number) =>
  all(db, 'SELECT * FROM payments WHERE booking_id = ? ORDER BY date, id', bookingId);

export async function addPayment(db: D1Database, bookingId: number, body: Record<string, unknown>) {
  await booking(db, bookingId);
  await run(db, 'INSERT INTO payments (booking_id, date, amount, kind, method, note) VALUES (?, ?, ?, ?, ?, ?)',
    bookingId, v.date(body, 'date', { required: true }), v.int(body, 'amount', { required: true, min: 1 }),
    v.oneOf(body, 'kind', ['payment', 'refund'] as const, 'payment'), v.oneOf(body, 'method', METHODS, 'cash'), v.str(body, 'note', { max: 500 }));
  return bookingId;
}

/** Deletes a payment and returns its booking id. */
export async function deletePayment(db: D1Database, id: number) {
  const { booking_id } = await mustFind<{ booking_id: number }>(db, 'SELECT booking_id FROM payments WHERE id = ?', id);
  await run(db, 'DELETE FROM payments WHERE id = ?', id);
  return booking_id;
}

/* ---------- expenses ---------- */

export const expensesFor = (db: D1Database, bookingId: number) =>
  all(db, 'SELECT * FROM expenses WHERE booking_id = ? ORDER BY date, id', bookingId);

/** Adds an expense; with booking_id it is a shoot expense, without it a studio cost. */
export async function addExpense(db: D1Database, body: Record<string, unknown>) {
  const bookingId = v.int(body, 'booking_id');
  if (bookingId) await booking(db, bookingId);
  await run(db, 'INSERT INTO expenses (booking_id, date, amount, category, note) VALUES (?, ?, ?, ?, ?)',
    bookingId, v.date(body, 'date', { required: true }), v.int(body, 'amount', { required: true, min: 1 }),
    v.oneOf(body, 'category', EXPENSE_CATEGORIES, 'other'), v.str(body, 'note', { max: 500 }));
  return bookingId;
}

export async function deleteExpense(db: D1Database, id: number) {
  const { booking_id } = await mustFind<{ booking_id: number | null }>(db, 'SELECT booking_id FROM expenses WHERE id = ?', id);
  await run(db, 'DELETE FROM expenses WHERE id = ?', id);
  return booking_id;
}

/* ---------- monthly studio costs ---------- */

export const listStudioCosts = (db: D1Database) => all(db, 'SELECT * FROM studio_costs ORDER BY end_date IS NOT NULL, name');

function parseCost(body: Record<string, unknown>) {
  const c = {
    name: v.str(body, 'name', { required: true, max: 100 })!,
    category: v.oneOf(body, 'category', EXPENSE_CATEGORIES, 'other'),
    amount: v.int(body, 'amount', { required: true, min: 1 })!,
    start_date: v.date(body, 'start_date', { required: true })!,
    end_date: v.date(body, 'end_date'),
  };
  if (c.end_date && c.end_date < c.start_date) throw new HttpError(400, 'end_date: must be after the start date');
  return c;
}

export async function saveStudioCost(db: D1Database, id: number | null, body: Record<string, unknown>) {
  const c = parseCost(body);
  if (id) {
    await mustFind(db, 'SELECT id FROM studio_costs WHERE id = ?', id);
    await run(db, 'UPDATE studio_costs SET name = ?, category = ?, amount = ?, start_date = ?, end_date = ? WHERE id = ?',
      c.name, c.category, c.amount, c.start_date, c.end_date, id);
  } else {
    await run(db, 'INSERT INTO studio_costs (name, category, amount, start_date, end_date) VALUES (?, ?, ?, ?, ?)',
      c.name, c.category, c.amount, c.start_date, c.end_date);
  }
  return listStudioCosts(db);
}

/* ---------- staff payments ---------- */

export async function addStaffPayment(db: D1Database, body: Record<string, unknown>) {
  const personId = v.int(body, 'person_id', { required: true, min: 1 })!;
  await mustFind(db, 'SELECT id FROM people WHERE id = ?', personId);
  await run(db, 'INSERT INTO staff_payments (person_id, date, amount, kind, method, note) VALUES (?, ?, ?, ?, ?, ?)',
    personId, v.date(body, 'date', { required: true }), v.int(body, 'amount', { required: true, min: 1 }),
    v.oneOf(body, 'kind', STAFF_PAY_KINDS, 'event'), v.oneOf(body, 'method', METHODS, 'cash'), v.str(body, 'note', { max: 500 }));
}

export async function deleteStaffPayment(db: D1Database, id: number) {
  await mustFind(db, 'SELECT id FROM staff_payments WHERE id = ?', id);
  await run(db, 'DELETE FROM staff_payments WHERE id = ?', id);
}

/* ---------- reports ---------- */

/** What a team member earned and was paid: event fees, salary settings and payments. One person, or everyone. */
export async function payData(db: D1Database, personId?: number) {
  const only = personId ? 'AND p.id = ?' : '';
  const args = personId ? [personId] : [];
  return {
    people: await all(db, `SELECT p.id, p.name, p.phone, p.pay_type, p.monthly_salary, p.event_rate, p.salary_since, p.created_at, p.active
      FROM people p WHERE (p.active = 1 OR EXISTS (SELECT 1 FROM staff_payments s WHERE s.person_id = p.id)) ${only} ORDER BY p.name`, ...args),
    fees: await all(db, `SELECT ec.person_id, ec.role, ec.fee, e.date, e.name AS event_name, b.title
      FROM event_crew ec JOIN events e ON e.id = ec.event_id JOIN bookings b ON b.id = e.booking_id JOIN people p ON p.id = ec.person_id
      WHERE ec.fee IS NOT NULL AND b.status != 'cancelled' ${only} ORDER BY e.date`, ...args),
    paid: await all(db, `SELECT s.*, p.name FROM staff_payments s JOIN people p ON p.id = s.person_id WHERE 1 = 1 ${only} ORDER BY s.date, s.id`, ...args),
  };
}

/** Everything needed for the money summary between two AD dates. */
export async function financeData(db: D1Database, from: string, to: string) {
  return {
    payments: await all(db, `SELECT pm.*, b.title, c.name AS client_name FROM payments pm
      JOIN bookings b ON b.id = pm.booking_id JOIN clients c ON c.id = b.client_id
      WHERE pm.date BETWEEN ? AND ? ORDER BY pm.date, pm.id`, from, to),
    expenses: await all(db, `SELECT x.*, b.title FROM expenses x LEFT JOIN bookings b ON b.id = x.booking_id
      WHERE x.date BETWEEN ? AND ? ORDER BY x.date, x.id`, from, to),
    studio_costs: await listStudioCosts(db),
    ...(await payData(db)),
  };
}

/** Bookings that still owe money: price − discount − payments + refunds > 0. */
export const outstanding = (db: D1Database) => all(db,
  `SELECT b.id, b.title, b.package, b.status, b.total_price, b.discount, c.name AS client_name, c.phone AS client_phone,
     COALESCE((SELECT SUM(CASE kind WHEN 'refund' THEN -amount ELSE amount END) FROM payments WHERE booking_id = b.id), 0) AS paid,
     (SELECT MIN(date) FROM events WHERE booking_id = b.id) AS first_date
   FROM bookings b JOIN clients c ON c.id = b.client_id
   WHERE b.status != 'cancelled' AND b.total_price IS NOT NULL
     AND COALESCE(b.total_price, 0) - COALESCE(b.discount, 0)
       - COALESCE((SELECT SUM(CASE kind WHEN 'refund' THEN -amount ELSE amount END) FROM payments WHERE booking_id = b.id), 0) > 0
   ORDER BY first_date IS NULL, first_date`);
