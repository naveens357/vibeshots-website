// Bikram Sambat (BS) dates for the studio. Everything is stored as AD
// "YYYY-MM-DD"; these helpers convert for display and for the BS date picker.
import NepaliDate from 'nepali-date-converter';

export const BS_MONTHS = ['Baisakh', 'Jestha', 'Asar', 'Shrawan', 'Bhadra', 'Asoj', 'Kartik', 'Mangsir', 'Poush', 'Magh', 'Falgun', 'Chaitra'];
export const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export interface Bs { year: number; month: number; day: number } // month is 0-based

const pad = (n: number) => String(n).padStart(2, '0');

/** "2026-11-28" -> local Date at midnight (no time-zone shift). */
export const adDate = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
};
export const adIso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const todayIso = () => adIso(new Date());
export const addDays = (iso: string, n: number) => {
  const d = adDate(iso);
  d.setDate(d.getDate() + n);
  return adIso(d);
};

export function toBs(iso: string): Bs {
  const { year, month, date } = new NepaliDate(adDate(iso)).getBS();
  return { year, month, day: date };
}
export const fromBs = ({ year, month, day }: Bs) => adIso(new NepaliDate(year, month, day).toJsDate());

/** Days in a BS month (29–32). */
export function bsMonthLength(year: number, month: number): number {
  const start = adDate(fromBs({ year, month, day: 1 }));
  const next = month === 11 ? { year: year + 1, month: 0 } : { year, month: month + 1 };
  const end = adDate(fromBs({ ...next, day: 1 }));
  return Math.round((+end - +start) / 864e5);
}

/** "12 Mangsir 2083" */
export const bsLabel = (iso: string) => {
  const b = toBs(iso);
  return `${b.day} ${BS_MONTHS[b.month]} ${b.year}`;
};
/** "28 Nov 2026" */
export const adLabel = (iso: string) => adDate(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
/** "Saturday" */
export const weekday = (iso: string) => adDate(iso).toLocaleDateString('en-GB', { weekday: 'long' });
/** "Sat, 12 Mangsir 2083 (28 Nov 2026)" */
export const fullLabel = (iso: string) => `${weekday(iso).slice(0, 3)}, ${bsLabel(iso)} (${adLabel(iso)})`;

/** "07:30" -> "7:30 AM" */
export function timeLabel(t: string | null | undefined) {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  return `${((h + 11) % 12) + 1}:${pad(m)} ${h < 12 ? 'AM' : 'PM'}`;
}
