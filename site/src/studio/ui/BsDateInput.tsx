// Date picker in Bikram Sambat: year / month / day selects. The value is AD "YYYY-MM-DD".
import { BS_MONTHS, adLabel, bsMonthLength, fromBs, toBs, todayIso, weekday } from '../lib/bs';

interface Props { value: string | null; onChange: (iso: string) => void }

export function BsDateInput({ value, onChange }: Props) {
  const iso = value || todayIso();
  const bs = toBs(iso);
  const thisYear = toBs(todayIso()).year;
  const years = Array.from({ length: 6 }, (_, i) => thisYear - 1 + i);
  if (!years.includes(bs.year)) years.unshift(bs.year);
  const days = bsMonthLength(bs.year, bs.month);

  const change = (part: Partial<typeof bs>) => {
    const next = { ...bs, ...part };
    next.day = Math.min(next.day, bsMonthLength(next.year, next.month));
    onChange(fromBs(next));
  };

  return (
    <span class="bsdate">
      <select aria-label="Day (BS)" value={bs.day} onChange={(e) => change({ day: Number(e.currentTarget.value) })}>
        {Array.from({ length: days }, (_, i) => <option value={i + 1}>{i + 1}</option>)}
      </select>
      <select aria-label="Month (BS)" value={bs.month} onChange={(e) => change({ month: Number(e.currentTarget.value) })}>
        {BS_MONTHS.map((m, i) => <option value={i}>{m}</option>)}
      </select>
      <select aria-label="Year (BS)" value={bs.year} onChange={(e) => change({ year: Number(e.currentTarget.value) })}>
        {years.map((y) => <option value={y}>{y}</option>)}
      </select>
      <small class="muted">{value ? `${weekday(iso)}, ${adLabel(iso)}` : 'Pick a date'}</small>
    </span>
  );
}
