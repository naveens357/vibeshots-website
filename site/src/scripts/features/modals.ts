/** Modals: "Check your date" ([data-check]) and the film player ([data-film]). */
import { $, $$ } from '../dom';
import { setMenu } from './menu';

const checkModal = $('#checkModal');
const filmModal = $('#filmModal');
const filmSlot = $('[data-film-slot]');

const openModal = (m: HTMLElement | null) => {
  setMenu(false);
  m?.classList.add('on');
  setTimeout(() => $<HTMLInputElement>('input', m!)?.focus(), 50);
};
const closeModals = () => {
  $$('.modal.on').forEach((m) => m.classList.remove('on'));
  if (filmSlot) filmSlot.innerHTML = '';
};

/** YouTube / Vimeo links become privacy-friendly autoplay embeds; other URLs pass through. */
function embedUrl(url: string) {
  if (!url) return '';
  const yt = url.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/);
  if (yt) return `https://www.youtube-nocookie.com/embed/${yt[1]}?autoplay=1&rel=0`;
  const vm = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vm) return `https://player.vimeo.com/video/${vm[1]}?autoplay=1&dnt=1`;
  return url;
}

const playerHtml = (src: string) => /\.(mp4|webm)(\?|$)/i.test(src)
  ? `<video src="${src}" controls autoplay playsinline style="width:100%;height:100%;background:#000"></video>`
  : `<iframe src="${src}" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen title="Film"></iframe>`;

document.addEventListener('click', (e) => {
  const t = e.target as Element;
  if (t.closest('[data-check]')) { e.preventDefault(); $('#mRes')?.classList.remove('on'); openModal(checkModal); }
  const film = t.closest<HTMLElement>('[data-film]');
  if (film) {
    const src = embedUrl(film.dataset.film || '');
    if (src && filmSlot) {
      e.preventDefault();
      filmSlot.innerHTML = playerHtml(src);
      openModal(filmModal);
    }
  }
  if (t.closest('[data-close]') || t.classList.contains('modal')) closeModals();
});
addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeModals(); setMenu(false); } });
