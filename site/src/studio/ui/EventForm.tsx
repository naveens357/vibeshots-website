// Add or edit one event: name, BS date, times, venue, map link, notes.
import type { StudioEvent } from '../lib/types';
import { BsDateInput } from './BsDateInput';
import { ErrorNote, Field, useForm, useSave } from './forms';

const EVENT_NAMES = ['Mehendi', 'Haldi', 'Engagement', 'Janti', 'Wedding day', 'Reception', 'Bidaai', 'Pre-wedding shoot', 'Maternity shoot', 'Commercial shoot'];

interface Props {
  initial: Partial<StudioEvent>;
  onSave: (values: Record<string, unknown>) => Promise<unknown>;
  onCancel: () => void;
  onDelete?: () => Promise<unknown>;
}

export function EventForm({ initial, onSave, onCancel, onDelete }: Props) {
  const form = useForm({
    name: initial.name ?? '', date: initial.date ?? '', call_time: initial.call_time ?? '', end_time: initial.end_time ?? '',
    venue: initial.venue ?? '', map_url: initial.map_url ?? '', notes: initial.notes ?? '',
  });
  const save = useSave();
  const v = form.values;

  return (
    <form onSubmit={(e) => { e.preventDefault(); save.run(() => onSave(v)); }}>
      <h2>{initial.id ? 'Edit event' : 'New event'}</h2>
      <div class="grid">
        <Field label="Event"><input required list="evnames" value={v.name} onInput={form.on('name')} placeholder="e.g. Haldi" /></Field>
        <datalist id="evnames">{EVENT_NAMES.map((n) => <option value={n} />)}</datalist>
        <Field label="Date (BS)"><BsDateInput value={v.date || null} onChange={(d) => form.set('date', d)} /></Field>
        <Field label="Call time"><input type="time" value={v.call_time} onInput={form.on('call_time')} /></Field>
        <Field label="Ends about"><input type="time" value={v.end_time} onInput={form.on('end_time')} /></Field>
        <Field label="Venue" wide><input value={v.venue} onInput={form.on('venue')} placeholder="e.g. Hotel Heritage, Bhaktapur" /></Field>
        <Field label="Google Maps link" wide hint="Open the place in Google Maps, tap Share, copy the link"><input type="url" value={v.map_url} onInput={form.on('map_url')} /></Field>
        <Field label="Notes for the crew" wide><textarea rows={2} value={v.notes} onInput={form.on('notes')} placeholder="Dress code, parking, contact person…" /></Field>
      </div>
      <ErrorNote error={save.error} />
      <div class="row">
        <button class="btn" disabled={save.busy || !v.date}>{save.busy ? 'Saving…' : 'Save event'}</button>
        <button type="button" class="btn ghost" onClick={onCancel}>Cancel</button>
        {onDelete && <button type="button" class="link danger" onClick={() => confirm('Delete this event and its crew?') && save.run(onDelete)}>Delete event</button>}
      </div>
    </form>
  );
}
