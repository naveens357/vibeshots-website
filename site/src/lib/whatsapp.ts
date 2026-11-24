/**
 * WhatsApp click-to-chat link. No data imports, so it is safe to use in both
 * server-rendered pages and browser scripts.
 */
export const waUrl = (number: string | number, text = '') =>
  `https://wa.me/${number}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
