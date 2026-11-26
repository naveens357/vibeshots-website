// Team members: owners, staff and freelancers.
import { all, mustFind, run } from '../db';
import { HttpError } from '../http';
import * as v from '../validate';

export const ROLES = ['photographer', 'cinematographer', 'drone', 'editor'] as const;
export type Role = (typeof ROLES)[number];

type Row = {
  id: number; name: string; phone: string | null; email: string | null; access: string; roles: string;
  pay_type: string; monthly_salary: number | null; event_rate: number | null; active: number; notes: string | null;
};

const toPerson = (r: Row) => ({ ...r, roles: JSON.parse(r.roles) as Role[], active: !!r.active });

/** Everything about a person (owners only). */
export const listPeople = async (db: D1Database) =>
  (await all<Row>(db, 'SELECT * FROM people ORDER BY active DESC, name')).map(toPerson);

export const getPerson = async (db: D1Database, id: number) => toPerson(await mustFind<Row>(db, 'SELECT * FROM people WHERE id = ?', id));

/** Name, phone and roles only: what a staff member may see about colleagues. */
export const listColleagues = async (db: D1Database) =>
  (await all<Row>(db, 'SELECT id, name, phone, roles FROM people WHERE active = 1 ORDER BY name'))
    .map((r) => ({ id: r.id, name: r.name, phone: r.phone, roles: JSON.parse(r.roles) as Role[] }));

function parse(body: Record<string, unknown>) {
  return {
    name: v.str(body, 'name', { required: true, max: 100 })!,
    phone: v.str(body, 'phone', { max: 30 }),
    email: v.email(body, 'email'),
    access: v.oneOf(body, 'access', ['owner', 'staff', 'none'] as const, 'none'),
    roles: JSON.stringify(v.list(body, 'roles', ROLES)),
    pay_type: v.oneOf(body, 'pay_type', ['salary', 'per_event', 'both'] as const, 'per_event'),
    monthly_salary: v.int(body, 'monthly_salary'),
    event_rate: v.int(body, 'event_rate'),
    active: body.active === false ? 0 : 1,
    notes: v.str(body, 'notes', { max: 2000 }),
  };
}

const uniqueEmail = (err: unknown) => {
  if (String(err).includes('UNIQUE')) throw new HttpError(400, 'email: another person already uses this email');
  throw err;
};

export async function createPerson(db: D1Database, body: Record<string, unknown>) {
  const p = parse(body);
  if (p.access !== 'none' && !p.email) throw new HttpError(400, 'email: needed so this person can log in');
  const res = await run(db,
    `INSERT INTO people (name, phone, email, access, roles, pay_type, monthly_salary, event_rate, active, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    p.name, p.phone, p.email, p.access, p.roles, p.pay_type, p.monthly_salary, p.event_rate, p.active, p.notes,
  ).catch(uniqueEmail);
  return getPerson(db, Number(res.meta.last_row_id));
}

export async function updatePerson(db: D1Database, id: number, body: Record<string, unknown>, actingPersonId: number) {
  await getPerson(db, id);
  const p = parse(body);
  if (p.access !== 'none' && !p.email) throw new HttpError(400, 'email: needed so this person can log in');
  if (id === actingPersonId && (p.access !== 'owner' || !p.active)) throw new HttpError(400, 'You cannot remove your own owner access.');
  await run(db,
    `UPDATE people SET name = ?, phone = ?, email = ?, access = ?, roles = ?, pay_type = ?, monthly_salary = ?,
     event_rate = ?, active = ?, notes = ? WHERE id = ?`,
    p.name, p.phone, p.email, p.access, p.roles, p.pay_type, p.monthly_salary, p.event_rate, p.active, p.notes, id,
  ).catch(uniqueEmail);
  return getPerson(db, id);
}
