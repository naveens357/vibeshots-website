// Talks to the studio API. Writes carry the X-Studio header the Worker requires.
import { useCallback, useEffect, useState } from 'preact/hooks';

const BASE = '/studio/api';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export async function api<T>(path: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET', body?: unknown): Promise<T> {
  const write = method !== 'GET';
  const res = await fetch(`${BASE}${path}`, {
    method,
    credentials: 'same-origin',
    headers: write ? { 'Content-Type': 'application/json', 'X-Studio': '1' } : {},
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, (data as { error?: string }).error || `Request failed (${res.status})`);
  return data as T;
}

/** Loads `path` (null to skip) and gives { data, error, loading, reload, setData }. */
export function useApi<T>(path: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(!!path);
  const reload = useCallback(() => {
    if (!path) return;
    setLoading(true);
    api<T>(path)
      .then((d) => { setData(d); setError(null); })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [path]);
  useEffect(reload, [reload]);
  return { data, error, loading, reload, setData };
}
