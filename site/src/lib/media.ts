/** Props for the Media component, derived from content entries. */

type Cover = { cover: string; coverAlt: string; coverTone: string; coverLabel: string };
type GalleryLayout = 'full' | 'half' | 'third' | 'center';

/** Media props for an entry's cover photo; `altFallback` is used when no alt text was written. */
export const coverProps = (d: Cover, altFallback = '') => ({
  src: d.cover,
  alt: d.coverAlt || altFallback,
  tone: d.coverTone,
  label: d.coverLabel,
});

const gallerySizes: Record<GalleryLayout, string> = {
  full: '100vw',
  half: '(max-width: 760px) 100vw, 50vw',
  third: '(max-width: 760px) 100vw, 33vw',
  center: '(max-width: 760px) 100vw, 33vw',
};

/** Responsive sizes and aspect ratio for a gallery photo's layout. */
export const galleryLayout = (layout: GalleryLayout) => ({
  sizes: gallerySizes[layout],
  ratio: layout === 'full' ? '32' : '23',
});
