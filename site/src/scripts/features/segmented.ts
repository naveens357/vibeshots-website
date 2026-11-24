/** Segmented toggles (.seg): a pill slides under the pressed button. */
import { $, $$ } from '../dom';

export function placePill(seg: HTMLElement) {
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
