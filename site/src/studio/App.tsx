// Studio dashboard shell: who is signed in, the menu and hash-based pages.
import { useEffect, useState } from 'preact/hooks';
import { useApi } from './lib/api';
import type { Me } from './lib/types';
import { ErrorNote, Loading } from './ui/forms';
import { Dashboard } from './views/Dashboard';
import { Calendar } from './views/Calendar';
import { Bookings, NewBooking } from './views/Bookings';
import { BookingDetail } from './views/BookingDetail';
import { People } from './views/People';

function useHash() {
  const [hash, setHash] = useState(location.hash || '#/');
  useEffect(() => {
    const on = () => { setHash(location.hash || '#/'); scrollTo(0, 0); };
    addEventListener('hashchange', on);
    return () => removeEventListener('hashchange', on);
  }, []);
  return hash.slice(1);
}

interface Page { path: RegExp; nav?: { label: string; href: string }; owner?: boolean; render: (me: Me, m: RegExpMatchArray) => preact.JSX.Element }

const pages: Page[] = [
  { path: /^\/$/, nav: { label: 'Dashboard', href: '#/' }, render: (me) => <Dashboard me={me} /> },
  { path: /^\/calendar$/, nav: { label: 'Calendar', href: '#/calendar' }, render: (me) => <Calendar me={me} /> },
  { path: /^\/bookings$/, nav: { label: 'Bookings', href: '#/bookings' }, owner: true, render: () => <Bookings /> },
  { path: /^\/bookings\/new$/, owner: true, render: () => <NewBooking /> },
  { path: /^\/bookings\/(\d+)$/, owner: true, render: (_, m) => <BookingDetail id={Number(m[1])} /> },
  { path: /^\/people$/, nav: { label: 'People', href: '#/people' }, owner: true, render: (me) => <People myId={me.personId} /> },
];

export default function App() {
  const { data: me, error, loading } = useApi<Me>('/me');
  const path = useHash();

  if (loading) return <main class="center-box"><Loading /></main>;
  if (error || !me) {
    return (
      <main class="center-box">
        <h1>Vibeshots Studio</h1>
        <ErrorNote error={error || 'Could not sign you in.'} />
        <p><a class="btn" href="/studio/">Try again</a> <a class="btn ghost" href="/cdn-cgi/access/logout">Sign in as someone else</a></p>
      </main>
    );
  }

  const allowed = pages.filter((p) => !p.owner || me.access === 'owner');
  const match = allowed.map((p) => ({ p, m: path.match(p.path) })).find((x) => x.m);

  return (
    <div class="shell">
      <aside class="side">
        <a class="brand" href="#/"><img src="/images/logo-light.png" alt="Vibeshots Nepal" width="106" height="30" /><span>Studio</span></a>
        <nav>
          {allowed.flatMap((p) => (p.nav ? [p.nav] : [])).map(({ label, href }) => {
            const on = href === '#/' ? path === '/' : path.startsWith(href.slice(1));
            return <a href={href} class={on ? 'on' : ''}>{label}</a>;
          })}
          {me.access === 'owner' && <a href="/admin/" target="_blank" rel="noopener">Website content ↗</a>}
        </nav>
        <div class="who">
          <b>{me.name}</b>
          <small>{me.email} · {me.access === 'owner' ? 'Owner' : 'Staff'}</small>
          <a href="/cdn-cgi/access/logout">Log out</a>
        </div>
      </aside>
      <main class="main">
        {match ? match.p.render(me, match.m!) : <p class="muted">Page not found. <a href="#/">Go to the dashboard</a></p>}
      </main>
    </div>
  );
}
