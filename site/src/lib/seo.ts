/** Helpers for structured data (JSON-LD) and other search-engine metadata. */
import site from '../data/site.json';
import packages from '../data/packages.json';
import services from '../data/services.json';
import { np, igProfile } from './format';

const base = import.meta.env.BASE_URL.replace(/\/$/, '');

/** Absolute URL for a root-relative site path, including the deploy's base path. */
export function absUrl(path: string, site: URL | undefined): string {
  if (/^https?:\/\//.test(path)) return path;
  return new URL(`${base}${path.startsWith('/') ? path : `/${path}`}`, site).toString();
}

/** Reference to the studio's ProfessionalService node, e.g. as an author or seller. */
export const businessRef = (siteUrl: URL | undefined) => ({ '@id': `${absUrl('/', siteUrl)}#business` });

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
  siteUrl: URL | undefined,
) {
  return {
    '@type': 'VideoObject',
    name: v.name,
    description: v.description,
    thumbnailUrl: absUrl(v.poster, siteUrl),
    contentUrl: absUrl(v.url, siteUrl),
    uploadDate: v.date.toISOString(),
    ...(v.length && isoDuration(v.length) ? { duration: isoDuration(v.length) } : {}),
  };
}

// Breadcrumb names for sections (sections without their own page are skipped).
const sectionNames: Record<string, string> = {
  weddings: 'Wedding Stories',
  'pre-weddings': 'Pre-wedding Shoots',
  commercial: 'Commercial',
  journal: 'Journal',
};

/** Home › Section › Page, built from the URL. */
function breadcrumbs(title: string, pathname: string, siteUrl: URL | undefined) {
  const abs = (p: string) => absUrl(p, siteUrl);
  const segs = pathname.slice(base.length).split('/').filter(Boolean);
  const crumbs = [{ name: 'Home', url: abs('/') }];
  if (segs.length > 1 && sectionNames[segs[0]]) crumbs.push({ name: sectionNames[segs[0]], url: abs(`/${segs[0]}/`) });
  if (segs.length) crumbs.push({ name: title, url: new URL(pathname, siteUrl).toString() });
  return crumbs.length > 1
    ? [{ '@type': 'BreadcrumbList', itemListElement: crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: c.url })) }]
    : [];
}

/** The studio as a schema.org ProfessionalService, with services, areas and price range. */
function business(image: string, siteUrl: URL | undefined) {
  const abs = (p: string) => absUrl(p, siteUrl);
  const prices = packages.tiers.flatMap((t) => [t.bride.price, t.groom.price, t.both.price]);
  return {
    '@type': 'ProfessionalService',
    ...businessRef(siteUrl),
    name: site.name,
    alternateName: ['Vibeshots', 'Vibe Shots Nepal'],
    description: site.description,
    slogan: site.tagline,
    url: abs('/'),
    logo: abs('/images/logo-dark.png'),
    image,
    telephone: `+977${site.phonePrimary}`,
    ...(site.email ? { email: site.email } : {}),
    priceRange: `NPR ${np(Math.min(...prices))}–${np(Math.max(...prices))}`,
    currenciesAccepted: 'NPR',
    address: { '@type': 'PostalAddress', streetAddress: 'Sallaghari', addressLocality: 'Bhaktapur', postalCode: '44800', addressRegion: 'Bagmati Province', addressCountry: 'NP' },
    geo: { '@type': 'GeoCoordinates', latitude: site.mapLat, longitude: site.mapLng },
    hasMap: site.mapUrl,
    openingHoursSpecification: [{ '@type': 'OpeningHoursSpecification', dayOfWeek: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '10:00', closes: '18:00' }],
    areaServed: services.areas.map((name) => ({ '@type': name === 'Nepal' ? 'Country' : 'Place', name })),
    knowsAbout: services.groups.flatMap((g) => g.items.map((i) => i.name)).concat(['Hindu weddings', 'Newari weddings', 'Wedding videography', 'Commercial photography']),
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Photography and film services',
      itemListElement: services.groups.map((g) => ({
        '@type': 'OfferCatalog',
        name: g.title,
        itemListElement: g.items.map((i) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: i.name, description: i.text, url: abs(i.link) } })),
      })),
    },
    sameAs: [igProfile(site.instagramWeddings), igProfile(site.instagramCommercial), site.facebook, site.youtube, site.tiktok].filter(Boolean),
  };
}

/** Full JSON-LD for a page: business, website, breadcrumbs and any page-specific nodes. */
export function pageJsonLd(
  page: { title: string; pathname: string; image: string; extra?: Record<string, unknown>[] },
  siteUrl: URL | undefined,
): string {
  const home = absUrl('/', siteUrl);
  const graph = [
    business(page.image, siteUrl),
    { '@type': 'WebSite', '@id': `${home}#website`, name: site.name, url: home, inLanguage: 'en', publisher: businessRef(siteUrl) },
    ...breadcrumbs(page.title, page.pathname, siteUrl),
    ...(page.extra ?? []),
  ];
  // escape < so text in the data cannot close the <script> tag
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c');
}
