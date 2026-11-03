import site from '../data/site.json';
import packages from '../data/packages.json';

/** Nepali/Indian digit grouping: 118000 -> "1,18,000". */
export const np = (n: number) => Number(n).toLocaleString('en-IN');

/** Early-bird price, rounded to the nearest 50. */
export const earlyBird = (price: number) =>
  Math.round((price * (100 - packages.earlyBird.percent)) / 100 / 50) * 50;

export const waLink = (text = '', number = site.whatsapp) =>
  `https://wa.me/${number}${text ? `?text=${encodeURIComponent(text)}` : ''}`;

export const waPackage = (pkg: string) =>
  waLink(`Namaste Vibeshots, I'm interested in the ${pkg} package.`);

export const viberLink = (number = site.whatsapp) => `viber://chat?number=%2B${number}`;
export const igDm = (handle = site.instagramWeddings) => `https://ig.me/m/${handle}`;
export const igProfile = (handle = site.instagramWeddings) => `https://www.instagram.com/${handle}/`;
export const tel = (n: string) => `tel:+977${n}`;

/** Google Maps embed (no API key) and directions link for the studio pin. */
export const mapEmbed = (zoom = site.mapZoom) =>
  `https://www.google.com/maps?q=${site.mapLat},${site.mapLng}&z=${zoom}&hl=en&output=embed`;
export const mapDirections = () =>
  `https://www.google.com/maps/dir/?api=1&destination=${site.mapLat},${site.mapLng}`;

export const sectors: Record<string, string> = {
  moto: 'Motorsport',
  auto: 'Automotive',
  travel: 'Travel & Hospitality',
  brand: 'Brands & Product',
  event: 'Events',
};
