// BS month calendar of all events (owners) or your own (staff), with each person's shoot count.
import { useState } from 'preact/hooks';
import { BS_MONTHS, WEEKDAYS, adDate, addDays, bsMonthLength, fromBs, toBs, todayIso } from '../lib/bs';
import { useApi } from '../lib/api';
import type { CalendarEvent, Me } from '../lib/types';
import { crewByPerson } from '../lib/crew';
import { EventCard, contextOf } from '../ui/EventCard';
import { ErrorNote, Loading } from '../ui/forms';

export function Calendar({ me }: { me: Me }) {
  const now = toBs(todayIso());
  const [month, setMonth] = useState({ year: now.year, month: now.month });
  const [person, setPerson] = useState<number | 'all'>('all');
  const [picked, setPicked] = useState<string | null>(null);

  const days = bsMonthLength(month.year, month.month);
  const start = fromBs({ ...month, day: 1 });
  const end = addDays(start, days - 1);
  const { data, error, loading } = useApi<CalendarEvent[]>(`/events?from=${start}&to=${end}`);

  const events = (data ?? []).filter((e) => person === 'all' || e.crew.some((c) => c.person_id === person));
  const byDate = new Map<string, CalendarEvent[]>();
  for (const e of events) byDate.set(e.date, [...(byDate.get(e.date) ?? []), e]);

  // shoots per person this month (workload)
  const load = new Map<number, { name: string; count: number }>();
  for (const e of data ?? []) for (const p of crewByPerson(e.crew)) {
    load.set(p.person_id, { name: p.name, count: (load.get(p.person_id)?.count ?? 0) + 1 });
  }

  const shift = (n: number) => {
    const m = month.month + n;
    setMonth({ year: month.year + Math.floor(m / 12), month: ((m % 12) + 12) % 12 });
    setPicked(null);
  };
  const lead = adDate(start).getDay();
  const today = todayIso();

  return (
    <section>
      <header class="page-head">
        <div>
          <p class="eyebrow">Calendar</p>
          <h1>{BS_MONTHS[month.month]} {month.year}</h1>
        </div>
        <div class="row">
          <button class="btn ghost" onClick={() => shift(-1)}>← Previous</button>
          <button class="btn ghost" onClick={() => { setMonth({ year: now.year, month: now.month }); setPicked(null); }}>This month</button>
          <button class="btn ghost" onClick={() => shift(1)}>Next →</button>
        </div>
      </header>

      {me.access === 'owner' && load.size > 0 && (
        <div class="load">
          <button class={person === 'all' ? 'on' : ''} onClick={() => setPerson('all')}>Everyone · {data?.length ?? 0}</button>
          {[...load.entries()].sort((a, b) => b[1].count - a[1].count).map(([id, p]) => (
            <button class={person === id ? 'on' : ''} onClick={() => setPerson(id)}>{p.name} · {p.count}</button>
          ))}
        </div>
      )}
      <ErrorNote error={error} />
      {loading && <Loading />}

      <div class="cal">
        {WEEKDAYS.map((d) => <div class="cal-h">{d}</div>)}
        {Array.from({ length: lead }, () => <div class="cal-d empty" />)}
        {Array.from({ length: days }, (_, i) => {
          const iso = addDays(start, i);
          const list = byDate.get(iso) ?? [];
          return (
            <button class={`cal-d${iso === today ? ' today' : ''}${iso === picked ? ' picked' : ''}${list.length ? ' has' : ''}`} onClick={() => setPicked(iso)}>
              <span class="n">{i + 1}</span>
              <span class="ad">{adDate(iso).getDate()}/{adDate(iso).getMonth() + 1}</span>
              {list.slice(0, 3).map((e) => <span class={`chip k-${e.kind}`}>{e.title} · {e.name}</span>)}
              {list.length > 3 && <span class="more">+{list.length - 3} more</span>}
            </button>
          );
        })}
      </div>

      {picked && (
        <section class="group">
          <h2>{(byDate.get(picked) ?? []).length ? 'Events' : 'No events'} on {toBs(picked).day} {BS_MONTHS[toBs(picked).month]}</h2>
          {(byDate.get(picked) ?? []).map((e) => <EventCard event={e} ctx={contextOf(e)} canMessage={me.access === 'owner'} />)}
        </section>
      )}
    </section>
  );
}
