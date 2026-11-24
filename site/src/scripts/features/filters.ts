/** Images page weddings/commercial switch, and the commercial work filters. */
import { $, $$, press } from '../dom';
import { placePill } from './segmented';

/* Images page: weddings / commercial switch (also opens from #commercial) */
const wall = $('[data-cat-scope]');
if (wall) {
  const setCat = (cat: string) => {
    wall.dataset.catScope = cat;
    press($$('[data-seg=imgcat] button'), (b) => b.dataset.cat === cat);
    $$('[data-seg=imgcat]').forEach(placePill);
  };
  $$('[data-seg=imgcat] button').forEach((b) => b.addEventListener('click', () => {
    setCat(b.dataset.cat!);
    history.replaceState(null, '', b.dataset.cat === 'commercial' ? '#commercial' : location.pathname);
  }));
  if (location.hash === '#commercial') setCat('commercial');
}

/* commercial filters: stills / film mode and sector chips */
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
  press($$('[data-seg=mode] button'), (x) => x === b);
  placePill(b.closest('.seg')!);
  filterProjects();
}));
$$('.fchip').forEach((c) => c.addEventListener('click', () => {
  sector = c.dataset.f!;
  press($$('.fchip'), (x) => x === c);
  filterProjects();
}));
