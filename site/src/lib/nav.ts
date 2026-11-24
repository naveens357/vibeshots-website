/** Site pages, so the header, menu and footer share one list of links. */
export const pages = {
  stories: { href: '/weddings/', label: 'Stories' },
  films: { href: '/films/', label: 'Films' },
  images: { href: '/images/', label: 'Images' },
  preWeddings: { href: '/pre-weddings/', label: 'Pre-weddings' },
  ceremonies: { href: '/weddings/#ceremonies', label: 'Ceremonies' },
  commercial: { href: '/commercial/', label: 'Commercial' },
  services: { href: '/services/', label: 'Services' },
  packages: { href: '/packages/', label: 'Packages' },
  faq: { href: '/faq/', label: 'FAQ' },
  contact: { href: '/contact/', label: 'Contact' },
  about: { href: '/about/', label: 'About' },
  journal: { href: '/journal/', label: 'Journal' },
};

export type NavLink = { href: string; label: string };

/** Desktop header links. */
export const mainNav: NavLink[] = [pages.stories, pages.films, pages.images, pages.preWeddings, pages.commercial, pages.packages, pages.faq, pages.contact];

/** Extra links in the mobile menu. */
export const moreNav: NavLink[] = [{ ...pages.about, label: 'About us' }, pages.journal];

/** Footer link columns. */
export const footerNav: { title: string; links: NavLink[] }[] = [
  { title: 'Weddings', links: [pages.stories, pages.films, pages.images, pages.preWeddings, pages.ceremonies] },
  { title: 'Studio', links: [pages.services, pages.packages, pages.commercial, pages.about, pages.faq, pages.journal, pages.contact] },
];
