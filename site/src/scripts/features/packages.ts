/** Packages: bride/groom side switch, "see all inclusions", phone carousel, early-bird countdown. */
import { $, $$, press } from '../dom';
import { placePill } from './segmented';

/* bride / groom side: one choice syncs every package block on the page */
function setSide(side: string) {
  $$('[data-side-scope]').forEach((el) => (el.dataset.side = side));
  $$('[data-seg=side]').forEach((s) => {
    press($$('button', s), (b) => b.dataset.side === side);
    placePill(s);
  });
}
$$('[data-seg=side] button').forEach((b) => b.addEventListener('click', () => setSide(b.dataset.side!)));

/* package cards (phones): reveal the full list of inclusions */
$$('[data-tier-more]').forEach((b) => b.addEventListener('click', () => {
  b.closest('.tier')?.classList.add('open');
  b.setAttribute('aria-expanded', 'true');
}));

/* package carousel (phones): dots follow the swipe, opens on "Most popular" */
$$('.tiers').forEach((track) => {
  const dots = track.nextElementSibling?.matches('[data-tier-dots]') ? $$('button', track.nextElementSibling) : [];
  const cards = $$('.tier', track);
  if (!dots.length || !cards.length) return;
  const isCarousel = () => getComputedStyle(track).overflowX === 'auto';
  const center = (c: HTMLElement) => c.offsetLeft + c.offsetWidth / 2 - track.clientWidth / 2;
  const sync = () => {
    if (!isCarousel()) { cards.forEach((c) => c.classList.remove('off')); return; }
    const mid = track.scrollLeft;
    let best = 0;
    cards.forEach((c, i) => { if (Math.abs(center(c) - mid) < Math.abs(center(cards[best]) - mid)) best = i; });
    cards.forEach((c, i) => c.classList.toggle('off', i !== best));
    dots.forEach((d, i) => d.setAttribute('aria-current', String(i === best)));
  };
  dots.forEach((d, i) => d.addEventListener('click', () => track.scrollTo({ left: center(cards[i]), behavior: 'smooth' })));
  let raf = 0;
  track.addEventListener('scroll', () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(sync); }, { passive: true });
  track.addEventListener('scrollend', sync);
  addEventListener('resize', sync);
  const popular = cards.findIndex((c) => c.classList.contains('pop'));
  if (isCarousel() && popular > 0) track.scrollLeft = center(cards[popular]);
  sync();
});

/* early-bird countdown */
const cd = $('[data-countdown]');
if (cd) {
  const target = new Date(`${cd.dataset.countdown}T23:59:59+05:45`).getTime();
  const [d, h, m] = $$('b', cd);
  const tick = () => {
    const s = Math.max(0, target - Date.now());
    d.textContent = String(Math.floor(s / 864e5));
    h.textContent = String(Math.floor((s % 864e5) / 36e5));
    m.textContent = String(Math.floor((s % 36e5) / 6e4));
    if (s === 0) cd.closest('[data-ebanner]')?.setAttribute('hidden', '');
  };
  tick();
  setInterval(tick, 30000);
}
