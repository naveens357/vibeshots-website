/** "Check your date" form: a quick season hint, then a WhatsApp message to confirm. */
import { $ } from '../dom';
import { waUrl } from '../../lib/whatsapp';

const BUSY_SEASON = /mangsir|magh|falgun|baisakh|nov|dec|jan|feb|apr/i;

const checkForm = $<HTMLFormElement>('[data-checkform]');
checkForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  const field = (name: string) => (checkForm.elements.namedItem(name) as HTMLInputElement).value.trim();
  const date = field('date');
  const city = field('city');
  const res = $('#mRes')!;
  const msg = `Namaste Vibeshots, is ${date} in ${city} available for our wedding?`;
  res.innerHTML = (BUSY_SEASON.test(date)
    ? '<b>Popular saait season.</b> Dates go fast, so message us now to hold yours. '
    : '<b>Good news, this date is likely open.</b> Message us to confirm and hold it. ') +
    `<br><a class="btn btn-wa sm" style="margin-top:12px" target="_blank" rel="noopener" href="${waUrl(checkForm.dataset.wa || '', msg)}"><svg><use href="#i-wa"/></svg>Confirm on WhatsApp</a>`;
  res.classList.add('on');
});
