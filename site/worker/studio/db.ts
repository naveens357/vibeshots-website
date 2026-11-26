// D1 access: applies pending migrations once per Worker instance, and small
// query helpers so repositories stay short.
import { migrations } from './migrations';
import { HttpError } from './http';

let ready: Promise<void> | null = null;

/** Applies any migrations the database has not seen yet. Safe to run from several instances at once. */
export function ensureSchema(db: D1Database): Promise<void> {
  ready ??= (async () => {
    await db.prepare(`CREATE TABLE IF NOT EXISTS _migrations (id INTEGER PRIMARY KEY, name TEXT, applied_at TEXT DEFAULT (datetime('now')))`).run();
    const done = new Set((await db.prepare('SELECT id FROM _migrations').all<{ id: number }>()).results.map((r) => r.id));
    for (const m of migrations) {
      if (done.has(m.id)) continue;
      await db.batch([
        ...m.sql.map((s) => db.prepare(s)),
        db.prepare('INSERT OR IGNORE INTO _migrations (id, name) VALUES (?, ?)').bind(m.id, m.name),
      ]);
    }
  })().catch((err) => {
    ready = null; // retry on the next request
    throw err;
  });
  return ready;
}

export const all = async <T>(db: D1Database, sql: string, ...args: unknown[]) =>
  (await db.prepare(sql).bind(...args).all<T>()).results;

export const first = <T>(db: D1Database, sql: string, ...args: unknown[]) =>
  db.prepare(sql).bind(...args).first<T>();

export const run = (db: D1Database, sql: string, ...args: unknown[]) => db.prepare(sql).bind(...args).run();

/** Row or 404. */
export async function mustFind<T>(db: D1Database, sql: string, ...args: unknown[]): Promise<T> {
  const row = await first<T>(db, sql, ...args);
  if (!row) throw new HttpError(404, 'Not found.');
  return row;
}
