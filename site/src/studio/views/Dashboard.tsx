// Home: today, this week and later, from the events calendar. Staff see only their own shoots.
import { addDays, bsLabel, todayIso } from '../lib/bs';
import { useApi } from '../lib/api';
import type { CalendarEvent, Me } from '../lib/types';
import { EventCard, contextOf } from '../ui/EventCard';
import { ErrorNote, Loading } from '../ui/forms';

export function Dashboard({ me }: { me: Me }) {
  const today = todayIso();
  const weekEnd = addDays(today, 7);
  const { data, error, loading } = useApi<CalendarEvent[]>(`/events?from=${today}&to=${addDays(today, 60)}`);
  const owner = me.access === 'owner';
  const groups = [
    { title: 'Today', items: (data ?? []).filter((e) => e.date === today) },
    { title: 'Next 7 days', items: (data ?? []).filter((e) => e.date > today && e.date <= weekEnd) },
    { title: 'Later (next 2 months)', items: (data ?? []).filter((e) => e.date > weekEnd) },
  ];
  const unstaffed = (data ?? []).filter((e) => e.crew.length === 0).length;

  return (
    <section>
      <header class="page-head">
        <div>
          <p class="eyebrow">{bsLabel(today)}</p>
          <h1>{owner ? `Namaste, ${me.name.split(' ')[0]}` : 'My shoots'}</h1>
        </div>
        {owner && <a class="btn" href="#/bookings/new">New booking</a>}
      </header>
      {owner && data && (
        <div class="stats">
          <div><b>{groups[0].items.length}</b><span>events today</span></div>
          <div><b>{groups[1].items.length}</b><span>in the next 7 days</span></div>
          <div><b>{data.length}</b><span>in the next 2 months</span></div>
          <div class={unstaffed ? 'alert' : ''}><b>{unstaffed}</b><span>without crew</span></div>
        </div>
      )}
      <ErrorNote error={error} />
      {loading && <Loading />}
      {data && groups.map((g) => (
        <section class="group">
          <h2>{g.title} <small>({g.items.length})</small></h2>
          {g.items.length === 0 ? <p class="muted">Nothing booked.</p> : g.items.map((e) => <EventCard event={e} ctx={contextOf(e)} canMessage={owner} />)}
        </section>
      ))}
    </section>
  );
}

