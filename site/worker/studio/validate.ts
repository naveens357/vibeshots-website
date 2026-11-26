// Small input validators. Each returns a clean value or throws a 400 with a
// message the dashboard can show next to the form.
import { HttpError } from './http';

type Body = Record<string, unknown>;

const fail = (field: string, why: string): never => {
  throw new HttpError(400, `${field}: ${why}`);
};

export function str(body: Body, field: string, opts: { required?: boolean; max?: number } = {}): string | null {
  const v = body[field];
  if (v === undefined || v === null || v === '') {
    if (opts.required) fail(field, 'is required');
    return null;
  }
  if (typeof v !== 'string') return fail(field, 'must be text');
  const s = v.trim();
  if (opts.required && !s) fail(field, 'is required');
  if (s.length > (opts.max ?? 500)) fail(field, `must be at most ${opts.max ?? 500} characters`);
  return s || null;
}

export function int(body: Body, field: string, opts: { required?: boolean; min?: number } = {}): number | null {
  const v = body[field];
  if (v === undefined || v === null || v === '') {
    if (opts.required) fail(field, 'is required');
    return null;
  }
  const n = typeof v === 'number' ? v : Number(v);
  if (!Number.isInteger(n)) return fail(field, 'must be a whole number');
  if (n < (opts.min ?? 0)) fail(field, `must be at least ${opts.min ?? 0}`);
  return n;
}

export function oneOf<T extends string>(body: Body, field: string, values: readonly T[], fallback?: T): T {
  const v = body[field] ?? fallback;
  if (typeof v !== 'string' || !values.includes(v as T)) return fail(field, `must be one of ${values.join(', ')}`);
  return v as T;
}

/** AD date as YYYY-MM-DD. */
export function date(body: Body, field: string, opts: { required?: boolean } = {}): string | null {
  const s = str(body, field, { ...opts, max: 10 });
  if (s === null) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s) || Number.isNaN(Date.parse(`${s}T00:00:00Z`))) fail(field, 'must be a date (YYYY-MM-DD)');
  return s;
}

/** 24-hour time as HH:MM. */
export function time(body: Body, field: string): string | null {
  const s = str(body, field, { max: 5 });
  if (s === null) return null;
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(s)) fail(field, 'must be a time (HH:MM)');
  return s;
}

export function email(body: Body, field: string): string | null {
  const s = str(body, field, { max: 200 });
  if (s === null) return null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)) fail(field, 'must be an email address');
  return s.toLowerCase();
}

/** A list of allowed words, e.g. roles. */
export function list<T extends string>(body: Body, field: string, values: readonly T[]): T[] {
  const v = body[field] ?? [];
  if (!Array.isArray(v) || v.some((x) => !values.includes(x))) return fail(field, `must be a list of ${values.join(', ')}`);
  return [...new Set(v as T[])];
}

/** Positive integer id from a URL segment. */
export function id(raw: string | undefined): number {
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 1) throw new HttpError(404, 'Not found.');
  return n;
}
