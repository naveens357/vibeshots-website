// Clients: the couple or company a booking is for.
import { all, mustFind, run } from '../db';
import * as v from '../validate';

type Row = { id: number; name: string; phone: string | null; email: string | null; address: string | null; source: string | null; notes: string | null };

export const listClients = (db: D1Database) => all<Row>(db, 'SELECT * FROM clients ORDER BY name');
export const getClient = (db: D1Database, id: number) => mustFind<Row>(db, 'SELECT * FROM clients WHERE id = ?', id);

function parse(body: Record<string, unknown>) {
  return {
    name: v.str(body, 'name', { required: true, max: 150 })!,
    phone: v.str(body, 'phone', { max: 30 }),
    email: v.email(body, 'email'),
    address: v.str(body, 'address', { max: 300 }),
    source: v.str(body, 'source', { max: 100 }),
    notes: v.str(body, 'notes', { max: 2000 }),
  };
}

export async function createClient(db: D1Database, body: Record<string, unknown>) {
  const c = parse(body);
  const res = await run(db, 'INSERT INTO clients (name, phone, email, address, source, notes) VALUES (?, ?, ?, ?, ?, ?)',
    c.name, c.phone, c.email, c.address, c.source, c.notes);
  return getClient(db, Number(res.meta.last_row_id));
}

export async function updateClient(db: D1Database, id: number, body: Record<string, unknown>) {
  await getClient(db, id);
  const c = parse(body);
  await run(db, 'UPDATE clients SET name = ?, phone = ?, email = ?, address = ?, source = ?, notes = ? WHERE id = ?',
    c.name, c.phone, c.email, c.address, c.source, c.notes, id);
  return getClient(db, id);
}
