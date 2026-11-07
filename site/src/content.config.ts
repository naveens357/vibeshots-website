import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Placeholder tones used when no photo is uploaded yet (see .t-* in global.css).
const tone = z.enum(['bride', 'sindoor', 'haldi', 'mehendi', 'ivory', 'night', 'gold', 'temple', 'moto', 'moto2', 'travel', 'product']).default('ivory');

const galleryItem = z.object({
  src: z.string().optional().default(''),
  alt: z.string().optional().default(''),
  tone,
  label: z.string().optional().default(''),
  layout: z.enum(['full', 'half', 'third', 'center']).default('half'),
});

const cover = {
  cover: z.string().optional().default(''),
  coverAlt: z.string().optional().default(''),
  coverTone: tone,
  coverLabel: z.string().optional().default(''),
};

const seo = {
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
};

const stories = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/stories' }),
  schema: z.object({
    title: z.string(),
    /** Short phrase used as the story's title, e.g. "Meant to Be". */
    headline: z.string().optional().default(''),
    date: z.coerce.date(),
    dateBS: z.string().optional().default(''),
    venue: z.string(),
    city: z.string().optional().default(''),
    community: z.string().optional().default(''),
    ceremonies: z.array(z.string()).default([]),
    package: z.string().optional().default(''),
    team: z.string().optional().default(''),
    excerpt: z.string().optional().default(''),
    ...cover,
    /** Wide photo for the top of the story page (falls back to the cover). */
    hero: z.string().optional().default(''),
    /** Which side the title sits on, so it doesn't cover faces in the hero photo. */
    heroAlign: z.enum(['left', 'right']).default('left'),
    film: z.string().optional().default(''),
    filmPoster: z.string().optional().default(''),
    filmLength: z.string().optional().default(''),
    quote: z.string().optional().default(''),
    gallery: z.array(galleryItem).default([]),
    vendors: z.array(z.object({ role: z.string(), name: z.string(), url: z.string().optional().default('') })).default([]),
    featured: z.boolean().default(false),
    sample: z.boolean().default(false),
    ...seo,
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    client: z.string(),
    credit: z.string().optional().default(''),
    sector: z.enum(['moto', 'auto', 'travel', 'brand', 'event']),
    types: z.array(z.enum(['stills', 'motion'])).min(1),
    date: z.coerce.date(),
    location: z.string().optional().default(''),
    deliverables: z.string().optional().default(''),
    results: z.string().optional().default(''),
    ...cover,
    film: z.string().optional().default(''),
    gallery: z.array(galleryItem).default([]),
    featured: z.boolean().default(false),
    sample: z.boolean().default(false),
    ...seo,
  }),
});

const ceremonies = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/ceremonies' }),
  schema: z.object({
    title: z.string(),
    deva: z.string().optional().default(''),
    tagline: z.string(),
    order: z.number().default(0),
    ...cover,
    ...seo,
  }),
});

const journal = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/journal' }),
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
  loader: glob({ pattern: '**/*.md', base: './src/content/films' }),
  schema: z.object({
    title: z.string(),
    subtitle: z.string().optional().default(''),
    kind: z.enum(['reel', 'highlight', 'full']),
    url: z.string().optional().default(''),
    poster: z.string().optional().default(''),
    posterTone: tone,
    date: z.coerce.date(),
    dateBS: z.string().optional().default(''),
    venue: z.string().optional().default(''),
    length: z.string().optional().default(''),
    story: z.string().optional().default(''),
    sample: z.boolean().default(false),
  }),
});

// Albums (photobooks) and pre-wedding shoots share one shape.
const showcase = (base: string) => defineCollection({
  loader: glob({ pattern: '**/*.md', base }),
  schema: z.object({
    title: z.string(),
    location: z.string().optional().default(''),
    date: z.coerce.date(),
    excerpt: z.string().optional().default(''),
    ...cover,
    gallery: z.array(galleryItem).default([]),
    sample: z.boolean().default(false),
    ...seo,
  }),
});

export const collections = {
  stories, projects, ceremonies, journal, films,
  albums: showcase('./src/content/albums'),
  prewedding: showcase('./src/content/prewedding'),
};
