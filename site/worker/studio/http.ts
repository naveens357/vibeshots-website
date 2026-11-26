// HTTP helpers for the studio API: JSON responses, errors and body parsing.

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

const NO_STORE = { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' };

export const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', ...NO_STORE } });

export const text = (body: string, status: number) =>
  new Response(body, { status, headers: { 'Content-Type': 'text/plain; charset=utf-8', ...NO_STORE } });

export const errorResponse = (err: unknown) => {
  if (err instanceof HttpError) return json({ error: err.message }, err.status);
  console.error(err);
  return json({ error: 'Something went wrong on the server.' }, 500);
};

/** Request body as a plain object; anything else is a 400. */
export async function readBody(request: Request): Promise<Record<string, unknown>> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    throw new HttpError(400, 'Expected a JSON body.');
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new HttpError(400, 'Expected a JSON object.');
  return body as Record<string, unknown>;
}
