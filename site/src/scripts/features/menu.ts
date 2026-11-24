/** Mobile menu. */
import { $ } from '../dom';

const mnav = $('#mnav');
const menuBtn = $('[data-menu]');

export const setMenu = (on: boolean) => {
  mnav?.classList.toggle('on', on);
  menuBtn?.setAttribute('aria-expanded', String(on));
  document.body.style.overflow = on ? 'hidden' : '';
};

menuBtn?.addEventListener('click', () => setMenu(true));
$('[data-menu-close]')?.addEventListener('click', () => setMenu(false));
mnav?.addEventListener('click', (e) => { if ((e.target as Element).closest('a')) setMenu(false); });
