/** Sorting helpers for content collections. */
import { getCollection, type CollectionEntry, type CollectionKey } from 'astro:content';

type Dated = { data: { date: Date } };
type Featured = { data: { date: Date; featured: boolean } };

/** Newest first. */
export const byDateDesc = (a: Dated, b: Dated) => +b.data.date - +a.data.date;

/** Featured entries first, then newest first. */
export const featuredFirst = (a: Featured, b: Featured) => Number(b.data.featured) - Number(a.data.featured) || byDateDesc(a, b);

/** A collection sorted newest first, optionally filtered (e.g. drafts out). */
export async function newestFirst<C extends CollectionKey>(
  collection: C,
  filter?: (entry: CollectionEntry<C>) => boolean,
): Promise<CollectionEntry<C>[]> {
  const entries = (await getCollection(collection, filter)) as unknown as (CollectionEntry<C> & Dated)[];
  return entries.sort(byDateDesc);
}
