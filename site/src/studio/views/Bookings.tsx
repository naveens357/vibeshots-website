// Bookings list and the "new booking" form (owners).
import { useState } from 'preact/hooks';
import { api, useApi } from '../lib/api';
import { bsLabel } from '../lib/bs';
import { bookingBalance } from '../lib/finance';
import { npr } from '../lib/money';
import type { Booking, BookingSummary, Client } from '../lib/types';
import { BookingFields, KIND_LABEL, STATUS_LABEL, bookingDefaults } from '../ui/BookingFields';
import { ErrorNote, Field, Loading, useForm, useSave } from '../ui/forms';

export function Bookings() {
  const { data, error, loading } = useApi<BookingSummary[]>('/bookings');
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('active');
  const rows = (data ?? []).filter((b) =>
    (status === 'all' || (status === 'active' ? b.status === 'confirmed' || b.status === 'tentative' : b.status === status))
    && `${b.title} ${b.client_name} ${b.client_phone ?? ''}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <section>
      <header class="page-head">
        <div><p class="eyebrow">Bookings</p><h1>All bookings</h1></div>
        <a class="btn" href="#/bookings/new">New booking</a>
      </header>
      <div class="row filters">
        <input type="search" placeholder="Search name or phone" value={q} onInput={(e) => setQ(e.currentTarget.value)} />
        <select value={status} onChange={(e) => setStatus(e.currentTarget.value)}>
          <option value="active">Upcoming & tentative</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="all">All</option>
        </select>
      </div>
      <ErrorNote error={error} />
      {loading && <Loading />}
      {data && (
        <table class="tbl">
          <thead><tr><th>Booking</th><th>Client</th><th>Type</th><th>Dates (BS)</th><th>Events</th><th>Status</th><th class="num">Price</th><th class="num">Due</th></tr></thead>
          <tbody>
            {rows.map((b) => (
              <tr onClick={() => (location.hash = `#/bookings/${b.id}`)}>
                <td><a href={`#/bookings/${b.id}`}><b>{b.title}</b></a>{b.package && <small> · {b.package}</small>}</td>
                <td>{b.client_name}<br /><small class="muted">{b.client_phone}</small></td>
                <td>{KIND_LABEL[b.kind]}</td>
                <td>{b.first_date ? bsLabel(b.first_date) : '—'}{b.last_date && b.last_date !== b.first_date && <><br /><small>to {bsLabel(b.last_date)}</small></>}</td>
                <td>{b.event_count}</td>
                <td><span class={`tag s-${b.status}`}>{STATUS_LABEL[b.status]}</span></td>
                <td class="num">{npr((b.total_price ?? 0) - (b.discount ?? 0))}</td>
                <td class="num">{b.status === 'cancelled' ? '—' : npr(bookingBalance(b, [{ amount: b.paid, kind: 'payment' }]).due)}</td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={8} class="muted">No bookings match.</td></tr>}
          </tbody>
        </table>
      )}
    </section>
  );
}

export function NewBooking() {
  const clients = useApi<Client[]>('/clients');
  const form = useForm({ ...bookingDefaults, client_id: '' as string });
  const client = useForm({ name: '', phone: '', email: '', address: '', source: '' });
  const save = useSave();

  const submit = (e: Event) => {
    e.preventDefault();
    save.run(async () => {
      const { client_id, ...booking } = form.values;
      const created = await api<Booking>('/bookings', 'POST', client_id ? { ...booking, client_id: Number(client_id) } : { ...booking, client: client.values });
      location.hash = `#/bookings/${created.id}`;
    });
  };

  return (
    <section>
      <header class="page-head"><div><p class="eyebrow">Bookings</p><h1>New booking</h1></div></header>
      <form class="card form" onSubmit={submit}>
        <h2>Client</h2>
        <div class="grid">
          <Field label="Existing client">
            <select value={form.values.client_id} onChange={form.on('client_id')}>
              <option value="">New client…</option>
              {(clients.data ?? []).map((c) => <option value={c.id}>{c.name}{c.phone ? ` · ${c.phone}` : ''}</option>)}
            </select>
          </Field>
          {!form.values.client_id && <>
            <Field label="Client name"><input required value={client.values.name} onInput={client.on('name')} placeholder="e.g. Swastika Shrestha" /></Field>
            <Field label="Phone"><input value={client.values.phone} onInput={client.on('phone')} placeholder="98XXXXXXXX" /></Field>
            <Field label="Email"><input type="email" value={client.values.email} onInput={client.on('email')} /></Field>
            <Field label="Address"><input value={client.values.address} onInput={client.on('address')} /></Field>
            <Field label="How they found us"><input list="sources" value={client.values.source} onInput={client.on('source')} /></Field>
          </>}
        </div>
        <datalist id="sources"><option value="Instagram" /><option value="Facebook" /><option value="Google" /><option value="Website" /><option value="Referral" /><option value="Repeat client" /></datalist>
        <h2>Booking</h2>
        <BookingFields form={form} />
        <ErrorNote error={save.error} />
        <div class="row"><button class="btn" disabled={save.busy}>{save.busy ? 'Saving…' : 'Create booking'}</button><a class="btn ghost" href="#/bookings">Cancel</a></div>
        <p class="muted">Add the events (haldi, wedding day, reception…) on the next screen.</p>
      </form>
    </section>
  );
}
