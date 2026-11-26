// One event: BS/AD date, time, venue, crew, and WhatsApp briefs for the crew (owners).
import { fullLabel, timeLabel } from '../lib/bs';
import { crewBrief } from '../lib/messages';
import { crewByPerson } from '../lib/crew';
import { ROLE_LABEL, type CalendarEvent, type StudioEvent } from '../lib/types';
import { WhatsAppButton } from './WhatsAppButton';

export interface EventContext { title: string; client_name: string; client_phone: string | null; package?: string | null; bookingId: number }

/** Booking and client details carried by a calendar event. */
export const contextOf = (e: CalendarEvent): EventContext => ({ title: e.title, client_name: e.client_name, client_phone: e.client_phone, package: e.package, bookingId: e.booking_id });

interface Props { event: StudioEvent; ctx: EventContext; canMessage: boolean; showBooking?: boolean }

export function EventCard({ event: e, ctx, canMessage, showBooking = true }: Props) {
  const people = crewByPerson(e.crew);
  return (
    <article class="ev-card">
      <div class="ev-when">
        <b>{fullLabel(e.date)}</b>
        <span>{e.call_time ? `${timeLabel(e.call_time)}${e.end_time ? ` – ${timeLabel(e.end_time)}` : ''}` : 'Time not set'}</span>
      </div>
      <h3>
        {showBooking ? <a href={canMessage ? `#/bookings/${ctx.bookingId}` : undefined}>{ctx.title}</a> : null}
        {showBooking ? ' · ' : ''}{e.name}
      </h3>
      {e.venue && <p class="muted">📍 {e.venue}{e.map_url && <> · <a href={e.map_url} target="_blank" rel="noopener">Map</a></>}</p>}
      <p class="muted">Client: {ctx.client_name}{ctx.client_phone && <> · <a href={`tel:${ctx.client_phone}`}>{ctx.client_phone}</a></>}</p>
      {e.notes && <p class="note">{e.notes}</p>}
      <ul class="crew">
        {people.length === 0 && <li class="warn">No crew assigned yet</li>}
        {people.map((p) => (
          <li>
            <span><b>{p.name}</b> · {p.roles.map((r) => ROLE_LABEL[r]).join(' + ')}{!canMessage && p.phone && <> · <a href={`tel:${p.phone}`}>{p.phone}</a></>}</span>
            {canMessage && (
              <WhatsAppButton small phone={p.phone} message={crewBrief(e, ctx, p, p.roles)}>Send brief</WhatsAppButton>
            )}
          </li>
        ))}
      </ul>
    </article>
  );
}
