// Booking fields shared by the "new booking" and "edit booking" forms.
import packages from '../../data/packages.json';
import type { BookingKind, BookingStatus } from '../lib/types';
import { Field } from './forms';

export const KIND_LABEL: Record<BookingKind, string> = { wedding: 'Wedding', prewedding: 'Pre-wedding', commercial: 'Commercial', other: 'Other' };
export const STATUS_LABEL: Record<BookingStatus, string> = { tentative: 'Tentative', confirmed: 'Confirmed', completed: 'Completed', cancelled: 'Cancelled' };

export const bookingDefaults = {
  title: '', kind: 'wedding' as BookingKind, package: '', side: '' as string,
  total_price: null as number | null, discount: null as number | null, status: 'confirmed' as BookingStatus, notes: '',
};
export type BookingForm = typeof bookingDefaults;

const packageNames = [...packages.tiers.map((t) => t.name), packages.heritage?.name, ...packages.singles.map((s) => s.name)].filter(Boolean) as string[];

interface Props { form: { values: BookingForm; on: (k: keyof BookingForm) => (e: Event) => void } }

export function BookingFields({ form }: Props) {
  const { values: v, on } = form;
  return (
    <div class="grid">
      <Field label="Booking name" hint="Usually the couple, e.g. Biwash & Swastika"><input required value={v.title} onInput={on('title')} /></Field>
      <Field label="Type">
        <select value={v.kind} onChange={on('kind')}>{Object.entries(KIND_LABEL).map(([k, l]) => <option value={k}>{l}</option>)}</select>
      </Field>
      <Field label="Package"><input list="pkgs" value={v.package} onInput={on('package')} /></Field>
      <datalist id="pkgs">{packageNames.map((n) => <option value={n} />)}</datalist>
      <Field label="Side">
        <select value={v.side} onChange={on('side')}>
          <option value="">—</option><option value="bride">Bride side</option><option value="groom">Groom side</option><option value="both">Both families</option>
        </select>
      </Field>
      <Field label="Price (NPR)"><input type="number" min="0" step="500" value={v.total_price ?? ''} onInput={on('total_price')} /></Field>
      <Field label="Discount (NPR)"><input type="number" min="0" step="500" value={v.discount ?? ''} onInput={on('discount')} /></Field>
      <Field label="Status">
        <select value={v.status} onChange={on('status')}>{Object.entries(STATUS_LABEL).map(([k, l]) => <option value={k}>{l}</option>)}</select>
      </Field>
      <Field label="Notes" wide><textarea rows={3} value={v.notes} onInput={on('notes')} /></Field>
    </div>
  );
}
