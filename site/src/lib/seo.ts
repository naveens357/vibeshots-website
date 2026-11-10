/** Helpers for structured data (JSON-LD) and other search-engine metadata. */

const base = import.meta.env.BASE_URL.replace(/\/$/, '');

/** Absolute URL for a root-relative site path, including the deploy's base path. */
export function absUrl(path: string, site: URL | undefined): string {
  if (/^https?:\/\//.test(path)) return path;
  return new URL(`${base}${path.startsWith('/') ? path : `/${path}`}`, site).toString();
}

/** "2:45" or "1:02:30" to an ISO 8601 duration such as "PT2M45S". */
export function isoDuration(length: string): string | undefined {
  const parts = length.split(':').map((n) => parseInt(n, 10));
  if (!parts.length || parts.some(Number.isNaN)) return undefined;
  const [h, m, s] = parts.length === 3 ? parts : [0, ...parts.slice(-2)];
  return `PT${h ? `${h}H` : ''}${m ? `${m}M` : ''}${s ? `${s}S` : ''}` || undefined;
}

/** schema.org VideoObject for a self-hosted film. */
export function videoSchema(
  v: { name: string; description: string; url: string; poster: string; date: Date; length?: string },
  site: URL | undefined,
) {
  return {
    '@type': 'VideoObject',
    name: v.name,
    description: v.description,
    thumbnailUrl: absUrl(v.poster, site),
    contentUrl: absUrl(v.url, site),
    uploadDate: v.date.toISOString(),
    ...(v.length && isoDuration(v.length) ? { duration: isoDuration(v.length) } : {}),
  };
}
