// Site-wide interactions. Every feature checks its elements exist, so pages
// only pay for what they use.
const $ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => r.querySelector<T>(s);
const $$ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => [...r.querySelectorAll<T>(s)];

/* ---- header turns solid on scroll ---- */
const top = $('#top');
const onScroll = () => top?.classList.toggle('scrolled', scrollY > 80);
addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* ---- mobile menu ---- */
const mnav = $('#mnav');
const menuBtn = $('[data-menu]');
const setMenu = (on: boolean) => {
  mnav?.classList.toggle('on', on);
  menuBtn?.setAttribute('aria-expanded', String(on));
  document.body.style.overflow = on ? 'hidden' : '';
};
menuBtn?.addEventListener('click', () => setMenu(true));
$('[data-menu-close]')?.addEventListener('click', () => setMenu(false));
mnav?.addEventListener('click', (e) => { if ((e.target as Element).closest('a')) setMenu(false); });

/* ---- modals: check date + film ---- */
const checkModal = $('#checkModal');
const filmModal = $('#filmModal');
const filmSlot = $('[data-film-slot]');
const openModal = (m: HTMLElement | null) => { setMenu(false); m?.classList.add('on'); setTimeout(() => $<HTMLInputElement>('input', m!)?.focus(), 50); };
const closeModals = () => {
  $$('.modal.on').forEach((m) => m.classList.remove('on'));
  if (filmSlot) filmSlot.innerHTML = '';
};
document.addEventListener('click', (e) => {
  const t = e.target as Element;
  if (t.closest('[data-check]')) { e.preventDefault(); $('#mRes')?.classList.remove('on'); openModal(checkModal); }
  const film = t.closest<HTMLElement>('[data-film]');
  if (film) {
    const src = embedUrl(film.dataset.film || '');
    if (src && filmSlot) {
      e.preventDefault();
      filmSlot.innerHTML = /\.(mp4|webm)(\?|$)/i.test(src)
        ? `<video src="${src}" controls autoplay playsinline style="width:100%;height:100%;background:#000"></video>`
        : `<iframe src="${src}" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen title="Film"></iframe>`;
      openModal(filmModal);
    }
  }
  if (t.closest('[data-close]') || t.classList.contains('modal')) closeModals();
});
addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeModals(); setMenu(false); } });

function embedUrl(url: string) {
  if (!url) return '';
  const yt = url.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/);
  if (yt) return `https://www.youtube-nocookie.com/embed/${yt[1]}?autoplay=1&rel=0`;
  const vm = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vm) return `https://player.vimeo.com/video/${vm[1]}?autoplay=1&dnt=1`;
  return url;
}

const checkForm = $<HTMLFormElement>('[data-checkform]');
checkForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  const d = (checkForm.elements.namedItem('date') as HTMLInputElement).value.trim();
  const c = (checkForm.elements.namedItem('city') as HTMLInputElement).value.trim();
  const res = $('#mRes')!;
  const busy = /mangsir|magh|falgun|baisakh|nov|dec|jan|feb|apr/i.test(d);
  const msg = `Namaste Vibeshots, is ${d} in ${c} available for our wedding?`;
  res.innerHTML = (busy
    ? '<b>Popular saait season.</b> Dates go fast, so message us now to hold yours. '
    : '<b>Good news, this date is likely open.</b> Message us to confirm and hold it. ') +
    `<br><a class="btn btn-wa sm" style="margin-top:12px" target="_blank" rel="noopener" href="https://wa.me/${checkForm.dataset.wa}?text=${encodeURIComponent(msg)}"><svg><use href="#i-wa"/></svg>Confirm on WhatsApp</a>`;
  res.classList.add('on');
});

/* ---- segmented toggles (sliding pill) ---- */
function placePill(seg: HTMLElement) {
  const on = $<HTMLElement>('button[aria-pressed=true]', seg);
  const pill = $<HTMLElement>('.pill', seg);
  if (!on || !pill || !on.offsetWidth) return;
  pill.style.width = `${on.offsetWidth}px`;
  pill.style.transform = `translateX(${on.offsetLeft}px)`;
}
const segs = $$('.seg');
segs.forEach(placePill);
addEventListener('resize', () => segs.forEach(placePill));
// re-place the pill when web fonts swap in and change the button widths
if ('ResizeObserver' in window) segs.forEach((s) => new ResizeObserver(() => placePill(s)).observe(s));
document.fonts?.ready.then(() => segs.forEach(placePill));

/* bride / groom side: one choice syncs every package block on the page */
function setSide(side: string) {
  $$('[data-side-scope]').forEach((el) => (el.dataset.side = side));
  $$('[data-seg=side]').forEach((s) => {
    $$('button', s).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.side === side)));
    placePill(s);
  });
}
$$('[data-seg=side] button').forEach((b) => b.addEventListener('click', () => setSide(b.dataset.side!)));

/* ---- package cards (phones): reveal the full list of inclusions ---- */
$$('[data-tier-more]').forEach((b) => b.addEventListener('click', () => {
  b.closest('.tier')?.classList.add('open');
  b.setAttribute('aria-expanded', 'true');
}));

/* ---- package carousel (phones): dots follow the swipe, opens on "Most popular" ---- */
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

/* ---- Images page: weddings / commercial switch (also opens from #commercial) ---- */
const wall = $('[data-cat-scope]');
if (wall) {
  const setCat = (cat: string) => {
    wall.dataset.catScope = cat;
    $$('[data-seg=imgcat] button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.cat === cat)));
    $$('[data-seg=imgcat]').forEach(placePill);
  };
  $$('[data-seg=imgcat] button').forEach((b) => b.addEventListener('click', () => {
    setCat(b.dataset.cat!);
    history.replaceState(null, '', b.dataset.cat === 'commercial' ? '#commercial' : location.pathname);
  }));
  if (location.hash === '#commercial') setCat('commercial');
}

/* ---- commercial filters ---- */
let mode = 'all';
let sector = 'all';
function filterProjects() {
  let shown = 0;
  $$('[data-project]').forEach((t) => {
    const ok = (sector === 'all' || t.dataset.s === sector) && (mode === 'all' || (t.dataset.t || '').includes(mode));
    t.classList.toggle('hide', !ok);
    if (ok) shown++;
  });
  $('[data-empty]')?.classList.toggle('on', shown === 0);
}
$$('[data-seg=mode] button').forEach((b) => b.addEventListener('click', () => {
  mode = b.dataset.mode!;
  $$('[data-seg=mode] button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
  placePill(b.closest('.seg')!);
  filterProjects();
}));
$$('.fchip').forEach((c) => c.addEventListener('click', () => {
  sector = c.dataset.f!;
  $$('.fchip').forEach((x) => x.setAttribute('aria-pressed', String(x === c)));
  filterProjects();
}));

/* ---- BS / AD date fields ---- */
$$('.bsad').forEach((g) => g.addEventListener('click', (e) => {
  const b = (e.target as Element).closest('button');
  if (!b) return;
  $$('button', g).forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
  const inp = $<HTMLInputElement>('input.ev', g.parentElement!);
  const cal = $<HTMLInputElement>('input.ev-cal', g.parentElement!);
  if (!inp) return;
  inp.type = b.dataset.cal === 'AD' ? 'date' : 'text';
  if (cal) cal.value = b.dataset.cal!;
}));

/* ---- early-bird countdown ---- */
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

/* ---- preselect package from ?package=Name links ---- */
const wanted = new URLSearchParams(location.search).get('package');
const pkgSelect = $<HTMLSelectElement>('select[name=package]');
if (wanted && pkgSelect) {
  const opt = [...pkgSelect.options].find((o) => o.value.toLowerCase() === wanted.toLowerCase());
  if (opt) pkgSelect.value = opt.value;
}

/* ---- inquiry forms ----
   With a form service endpoint (e.g. Web3Forms) set in Site settings, the form
   posts there. Without one, it opens WhatsApp with the details filled in. */
const SKIP = new Set(['access_key', 'subject', 'website']);
$$<HTMLFormElement>('form[data-form]').forEach((f) => f.addEventListener('submit', async (e) => {
  e.preventDefault();
  if ((f.elements.namedItem('website') as HTMLInputElement | null)?.value) return; // bot trap
  const btn = f.querySelector('[type=submit]');
  btn?.classList.add('loading');
  const data = new FormData(f);
  const thanks = f.dataset.thanks || '/thank-you/';
  if (f.dataset.endpoint) {
    try {
      const res = await fetch(f.dataset.endpoint, { method: 'POST', body: data, headers: { Accept: 'application/json' } });
      if (res.ok) { location.href = thanks; return; }
    } catch { /* fall through to WhatsApp */ }
  }
  const lines: string[] = [];
  const grouped = new Map<string, string[]>();
  data.forEach((v, k) => {
    const val = String(v).trim();
    if (!val || SKIP.has(k)) return;
    grouped.set(k, [...(grouped.get(k) || []), val]);
  });
  grouped.forEach((vals, k) => {
    if (k.startsWith('cal-') || k === 'country-code') return;
    if (k === 'phone') { lines.push(`phone: ${grouped.get('country-code')?.[0] ?? ''} ${vals[0]}`.replace(': +  ', ': ')); return; }
    if (k.startsWith('date-')) {
      const cal = grouped.get(`cal-${k.slice(5)}`)?.[0] || '';
      lines.push(`${k.slice(5).replace(/-/g, ' ')}: ${vals[0]} ${cal}`.trim());
      return;
    }
    lines.push(`${k.replace(/-/g, ' ')}: ${vals.join(', ')}`);
  });
  const text = `Namaste Vibeshots! ${f.dataset.form} from the website:\n\n${lines.join('\n')}`;
  const waUrl = `https://wa.me/${f.dataset.wa}?text=${encodeURIComponent(text)}`;
  const win = window.open(waUrl, '_blank');
  if (win) { win.opener = null; location.href = thanks; } else { location.href = waUrl; }
}));

/* ---- parallax banners: the photo moves slower than the page ---- */
const banners = $$('[data-parallax]');
if (banners.length && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  let ticking = false;
  const update = () => {
    ticking = false;
    const vh = innerHeight;
    const speed = innerWidth < 760 ? 0.1 : 0.2;
    banners.forEach((b) => {
      const r = b.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) return;
      const max = r.height * 0.14;
      const off = Math.max(-max, Math.min(max, (r.top + r.height / 2 - vh / 2) * -speed));
      const m = b.querySelector<HTMLElement>('.pmedia');
      if (m) m.style.transform = `translate3d(0, ${off.toFixed(1)}px, 0) scale(1.04)`;
    });
  };
  const onTick = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
  addEventListener('scroll', onTick, { passive: true });
  addEventListener('resize', onTick);
  update();
}

/* ---- lightbox for the image wall ---- */
const lb = $('#lightbox');
const allImgs = $$<HTMLImageElement>('[data-lightbox] img');
if (lb && allImgs.length) {
  let i = 0;
  let lbImgs = allImgs;
  const img = $<HTMLImageElement>('img', lb)!;
  const cap = $('.lb-c', lb)!;
  const show = (n: number) => {
    i = (n + lbImgs.length) % lbImgs.length;
    img.src = lbImgs[i].currentSrc || lbImgs[i].src;
    img.alt = lbImgs[i].alt;
    cap.textContent = `${i + 1} / ${lbImgs.length}`;
  };
  // only cycle through the photos currently shown (the selected category)
  allImgs.forEach((im) => im.closest('.media')?.addEventListener('click', () => {
    lbImgs = allImgs.filter((x) => x.offsetParent !== null);
    show(lbImgs.indexOf(im));
    lb.classList.add('on');
  }));
  $('.lb-x', lb)?.addEventListener('click', () => lb.classList.remove('on'));
  $('.lb-p', lb)?.addEventListener('click', () => show(i - 1));
  $('.lb-n', lb)?.addEventListener('click', () => show(i + 1));
  lb.addEventListener('click', (e) => { if (e.target === lb) lb.classList.remove('on'); });
  addEventListener('keydown', (e) => {
    if (!lb.classList.contains('on')) return;
    if (e.key === 'ArrowLeft') show(i - 1);
    if (e.key === 'ArrowRight') show(i + 1);
    if (e.key === 'Escape') lb.classList.remove('on');
  });
}

/* ---- reveal on scroll ---- */
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((es) => es.forEach((en) => {
    if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
  }), { threshold: 0.12 });
  $$('.rv').forEach((el) => io.observe(el));
} else {
  $$('.rv').forEach((el) => el.classList.add('in'));
}
