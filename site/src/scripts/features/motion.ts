/** Scroll effects: parallax banners and fade-in on reveal. */
import { $$ } from '../dom';

/* parallax banners: the photo moves slower than the page */
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

/* reveal on scroll */
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((es) => es.forEach((en) => {
    if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
  }), { threshold: 0.12 });
  $$('.rv').forEach((el) => io.observe(el));
} else {
  $$('.rv').forEach((el) => el.classList.add('in'));
}
