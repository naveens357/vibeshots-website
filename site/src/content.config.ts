import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/** Optional text field that is '' when left empty. */
const text = () => z.string().optional().default('');
/** Marks example content that should be replaced. */
const sample = { sample: z.boolean().default(false) };
/** Self-hosted or YouTube/Vimeo film and its poster image. */
const film = { film: text(), filmPoster: text() };

// Placeholder tones used when no photo is uploaded yet (see .t-* in global.css).
const tone = z.enum(['bride', 'sindoor', 'haldi', 'mehendi', 'ivory', 'night', 'gold', 'temple', 'moto', 'moto2', 'travel', 'product']).default('ivory');

const galleryItem = z.object({
  src: text(),
  alt: text(),
  tone,
  label: text(),
  layout: z.enum(['full', 'half', 'third', 'center']).default('half'),
});
/** Photos shown in a grid on the detail page. */
const gallery = () => z.array(galleryItem).default([]);

const cover = {
  cover: text(),
  coverAlt: text(),
  coverTone: tone,
  coverLabel: text(),
};

/** Markdown files in src/content/<folder>. */
const markdown = (folder: string) => glob({ pattern: '**/*.md', base: `./src/content/${folder}` });

const seo = {
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
};

const stories = defineCollection({
  loader: markdown('stories'),
  schema: z.object({
    title: z.string(),
    /** Short phrase used as the story's title, e.g. "Meant to Be". */
    headline: text(),
    date: z.coerce.date(),
    dateBS: text(),
    venue: z.string(),
    city: text(),
    community: text(),
    ceremonies: z.array(z.string()).default([]),
    package: text(),
    team: text(),
    excerpt: text(),
    ...cover,
    /** Wide photo for the top of the story page (falls back to the cover). */
    hero: text(),
    /** Which side the title sits on, so it doesn't cover faces in the hero photo. */
    heroAlign: z.enum(['left', 'right']).default('left'),
    ...film,
    filmLength: text(),
    quote: text(),
    gallery: gallery(),
    vendors: z.array(z.object({ role: z.string(), name: z.string(), url: text() })).default([]),
    featured: z.boolean().default(false),
    ...sample,
    ...seo,
  }),
});

const projects = defineCollection({
  loader: markdown('projects'),
  schema: z.object({
    title: z.string(),
    client: z.string(),
    credit: text(),
    sector: z.enum(['moto', 'auto', 'travel', 'brand', 'event']),
    types: z.array(z.enum(['stills', 'motion'])).min(1),
    date: z.coerce.date(),
    location: text(),
    deliverables: text(),
    results: text(),
    ...cover,
    ...film,
    gallery: gallery(),
    featured: z.boolean().default(false),
    ...sample,
    ...seo,
  }),
});

const ceremonies = defineCollection({
  loader: markdown('ceremonies'),
  schema: z.object({
    title: z.string(),
    deva: text(),
    tagline: z.string(),
    order: z.number().default(0),
    ...cover,
    ...seo,
  }),
});

const journal = defineCollection({
  loader: markdown('journal'),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    excerpt: z.string(),
    ...cover,
    draft: z.boolean().default(false),
    ...seo,
  }),
});

const films = defineCollection({
  loader: markdown('films'),
  schema: z.object({
    title: z.string(),
    subtitle: text(),
    kind: z.enum(['reel', 'highlight', 'full']),
    url: text(),
    poster: text(),
    posterTone: tone,
    date: z.coerce.date(),
    dateBS: text(),
    venue: text(),
    length: text(),
    story: text(),
    ...sample,
  }),
});

// Pre-wedding shoots: cover, gallery and a short text.
const showcase = (folder: string) => defineCollection({
  loader: markdown(folder),
  schema: z.object({
    title: z.string(),
    location: text(),
    date: z.coerce.date(),
    excerpt: text(),
    ...cover,
    gallery: gallery(),
    ...sample,
    ...seo,
  }),
});

export const collections = {
  stories, projects, ceremonies, journal, films,
  prewedding: showcase('prewedding'),
};
