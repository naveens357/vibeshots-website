// One booking: details, client, events with crew, and WhatsApp messages (owners).
import { useState } from 'preact/hooks';
import { api, useApi } from '../lib/api';
import { todayIso } from '../lib/bs';
import { clientConfirmation } from '../lib/messages';
import { npr } from '../lib/money';
import type { Booking, Client, StudioEvent } from '../lib/types';
import { BookingFields, KIND_LABEL, STATUS_LABEL, bookingDefaults } from '../ui/BookingFields';
import { BookingMoney } from '../ui/BookingMoney';
import { CrewEditor } from '../ui/CrewEditor';
import { EventCard } from '../ui/EventCard';
import { EventForm } from '../ui/EventForm';
import { ErrorNote, Field, Loading, useForm, useSave } from '../ui/forms';
import { WhatsAppButton } from '../ui/WhatsAppButton';

export function BookingDetail({ id }: { id: number }) {
  const { data: b, error, loading, setData } = useApi<Booking>(`/bookings/${id}`);
  const [editing, setEditing] = useState<'booking' | 'client' | `event-${number}` | `crew-${number}` | 'new-event' | null>(null);
  const del = useSave();

  if (loading && !b) return <Loading />;
  if (error || !b) return <ErrorNote error={error || 'Not found'} />;

  const done = (next: Booking) => { setData(next); setEditing(null); };
  const remove = () => {
    if (!confirm(`Delete "${b.title}" with all its events? This cannot be undone.`)) return;
    del.run(async () => { await api(`/bookings/${b.id}`, 'DELETE'); location.hash = '#/bookings'; });
  };
  const ctx = { title: b.title, client_name: b.client.name, client_phone: b.client.phone, package: b.package, bookingId: b.id };
  const lastDate = b.events.at(-1)?.date;

  return (
    <section>
      <header class="page-head">
        <div>
          <p class="eyebrow"><a href="#/bookings">Bookings</a> · {KIND_LABEL[b.kind]}</p>
          <h1>{b.title} <span class={`tag s-${b.status}`}>{STATUS_LABEL[b.status]}</span></h1>
        </div>
        <div class="row">
          {b.events.length > 0 && <WhatsAppButton phone={b.client.phone} message={clientConfirmation(b)}>Send confirmation to client</WhatsAppButton>}
        </div>
      </header>

      <div class="cols">
        <div class="card">
          {editing === 'booking' ? <EditBooking b={b} onDone={done} onCancel={() => setEditing(null)} /> : (
            <>
              <h2>Booking <button class="link" onClick={() => setEditing('booking')}>Edit</button></h2>
              <dl class="kv">
                <dt>Package</dt><dd>{b.package || '—'}{b.side && ` · ${b.side === 'both' ? 'both families' : `${b.side} side`}`}</dd>
                <dt>Price</dt><dd>{npr(b.total_price) || '—'}{b.discount ? ` − ${npr(b.discount)} discount = ${npr((b.total_price ?? 0) - b.discount)}` : ''}</dd>
                {b.notes && <><dt>Notes</dt><dd class="pre">{b.notes}</dd></>}
              </dl>
            </>
          )}
        </div>
        <div class="card">
          {editing === 'client' ? <EditClient c={b.client} onDone={(c) => { setData({ ...b, client: c }); setEditing(null); }} onCancel={() => setEditing(null)} /> : (
            <>
              <h2>Client <button class="link" onClick={() => setEditing('client')}>Edit</button></h2>
              <dl class="kv">
                <dt>Name</dt><dd>{b.client.name}</dd>
                <dt>Phone</dt><dd>{b.client.phone ? <a href={`tel:${b.client.phone}`}>{b.client.phone}</a> : '—'}</dd>
                {b.client.email && <><dt>Email</dt><dd>{b.client.email}</dd></>}
                {b.client.address && <><dt>Address</dt><dd>{b.client.address}</dd></>}
                {b.client.source && <><dt>Source</dt><dd>{b.client.source}</dd></>}
              </dl>
            </>
          )}
        </div>
      </div>

      <section class="group">
        <h2>Events <small>({b.events.length})</small> <button class="btn sm" onClick={() => setEditing('new-event')}>Add event</button></h2>
        {editing === 'new-event' && (
          <div class="card"><EventForm initial={{ date: lastDate || todayIso() }} onCancel={() => setEditing(null)}
            onSave={(v) => api<Booking>(`/bookings/${b.id}/events`, 'POST', v).then(done)} /></div>
        )}
        {b.events.length === 0 && editing !== 'new-event' && <p class="muted">No events yet. Add the haldi, wedding day, reception…</p>}
        {b.events.map((e: StudioEvent) => (
          <div class="ev-wrap">
            {editing === `event-${e.id}` ? (
              <div class="card"><EventForm initial={e} onCancel={() => setEditing(null)}
                onSave={(v) => api<Booking>(`/events/${e.id}`, 'PUT', v).then(done)}
                onDelete={() => api<Booking>(`/events/${e.id}`, 'DELETE').then(done)} /></div>
            ) : editing === `crew-${e.id}` ? (
              <div class="card"><CrewEditor event={e} onCancel={() => setEditing(null)}
                onSave={(crew) => api<Booking>(`/events/${e.id}/crew`, 'PUT', { crew }).then(done)} /></div>
            ) : (
              <>
                <EventCard event={e} ctx={ctx} canMessage showBooking={false} />
                <div class="row ev-actions">
                  <button class="link" onClick={() => setEditing(`event-${e.id}`)}>Edit event</button>
                  <button class="link" onClick={() => setEditing(`crew-${e.id}`)}>Assign crew</button>
                  {e.crew.some((c) => c.fee) && <small class="muted">Crew cost {npr(e.crew.reduce((s, c) => s + (c.fee ?? 0), 0))}</small>}
                </div>
              </>
            )}
          </div>
        ))}
      </section>

      <BookingMoney b={b} onChange={setData} />

      <ErrorNote error={del.error} />
      <p><button class="link danger" onClick={remove} disabled={del.busy}>Delete booking</button></p>
    </section>
  );
}

function EditBooking({ b, onDone, onCancel }: { b: Booking; onDone: (b: Booking) => void; onCancel: () => void }) {
  const form = useForm({ ...bookingDefaults, ...Object.fromEntries(Object.keys(bookingDefaults).map((k) => [k, (b as any)[k] ?? (bookingDefaults as any)[k]])) });
  const save = useSave();
  return (
    <form onSubmit={(e) => { e.preventDefault(); save.run(async () => onDone(await api<Booking>(`/bookings/${b.id}`, 'PUT', form.values))); }}>
      <h2>Edit booking</h2>
      <BookingFields form={form} />
      <ErrorNote error={save.error} />
      <div class="row"><button class="btn" disabled={save.busy}>Save</button><button type="button" class="btn ghost" onClick={onCancel}>Cancel</button></div>
    </form>
  );
}

function EditClient({ c, onDone, onCancel }: { c: Client; onDone: (c: Client) => void; onCancel: () => void }) {
  const form = useForm({ name: c.name, phone: c.phone ?? '', email: c.email ?? '', address: c.address ?? '', source: c.source ?? '', notes: c.notes ?? '' });
  const save = useSave();
  return (
    <form onSubmit={(e) => { e.preventDefault(); save.run(async () => onDone(await api<Client>(`/clients/${c.id}`, 'PUT', form.values))); }}>
      <h2>Edit client</h2>
      <div class="grid">
        <Field label="Name"><input required value={form.values.name} onInput={form.on('name')} /></Field>
        <Field label="Phone"><input value={form.values.phone} onInput={form.on('phone')} /></Field>
        <Field label="Email"><input type="email" value={form.values.email} onInput={form.on('email')} /></Field>
        <Field label="Address"><input value={form.values.address} onInput={form.on('address')} /></Field>
        <Field label="How they found us"><input value={form.values.source} onInput={form.on('source')} /></Field>
        <Field label="Notes" wide><textarea rows={2} value={form.values.notes} onInput={form.on('notes')} /></Field>
      </div>
      <ErrorNote error={save.error} />
      <div class="row"><button class="btn" disabled={save.busy}>Save</button><button type="button" class="btn ghost" onClick={onCancel}>Cancel</button></div>
    </form>
  );
}
