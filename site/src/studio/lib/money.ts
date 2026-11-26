import { np } from '../../lib/format';

/** "NPR 1,18,000" (Nepali digit grouping); empty for no amount. */
export const npr = (n: number | null | undefined) => (n || n === 0 ? `NPR ${np(n)}` : '');
