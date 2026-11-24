/** Date labels used across the site (British English order, e.g. "19 December 2025"). */
const styles = {
  /** "December 2025" */
  monthYear: { month: 'long', year: 'numeric' },
  /** "Dec 2025" */
  monthShortYear: { month: 'short', year: 'numeric' },
  /** "19 December 2025" */
  full: { day: 'numeric', month: 'long', year: 'numeric' },
} satisfies Record<string, Intl.DateTimeFormatOptions>;

export type DateStyle = keyof typeof styles;

export const formatDate = (date: Date, style: DateStyle = 'full') => date.toLocaleDateString('en-GB', styles[style]);
