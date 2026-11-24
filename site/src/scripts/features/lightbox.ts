/** Lightbox for the image wall: click a photo, then arrows / keys to move through the shown photos. */
import { $, $$ } from '../dom';

const lb = $('#lightbox');
const allImgs = $$<HTMLImageElement>('[data-lightbox] img');
if (lb && allImgs.length) {
  let i = 0;
  let lbImgs = allImgs;
  const img = $<HTMLImageElement>('img', lb)!;
  const cap = $('.lb-c', lb)!;
  const close = () => lb.classList.remove('on');
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
  $('.lb-x', lb)?.addEventListener('click', close);
  $('.lb-p', lb)?.addEventListener('click', () => show(i - 1));
  $('.lb-n', lb)?.addEventListener('click', () => show(i + 1));
  lb.addEventListener('click', (e) => { if (e.target === lb) close(); });
  addEventListener('keydown', (e) => {
    if (!lb.classList.contains('on')) return;
    if (e.key === 'ArrowLeft') show(i - 1);
    if (e.key === 'ArrowRight') show(i + 1);
    if (e.key === 'Escape') close();
  });
}
