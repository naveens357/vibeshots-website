/** Header turns solid once the page scrolls. */
import { $ } from '../dom';

const top = $('#top');
const onScroll = () => top?.classList.toggle('scrolled', scrollY > 80);
addEventListener('scroll', onScroll, { passive: true });
onScroll();
