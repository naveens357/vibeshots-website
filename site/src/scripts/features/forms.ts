/**
 * Inquiry forms, plus the BS/AD switch on their date fields and ?package= preselect.
 * With a form service endpoint (e.g. Web3Forms) set in Site settings, the form
 * posts there. Without one, it opens WhatsApp with the details filled in.
 */
import { $, $$, press } from '../dom';
import { waUrl } from '../../lib/whatsapp';

/* BS / AD date fields */
$$('.bsad').forEach((g) => g.addEventListener('click', (e) => {
  const b = (e.target as Element).closest('button');
  if (!b) return;
  press($$('button', g), (x) => x === b);
  const inp = $<HTMLInputElement>('input.ev', g.parentElement!);
  const cal = $<HTMLInputElement>('input.ev-cal', g.parentElement!);
  if (!inp) return;
  inp.type = b.dataset.cal === 'AD' ? 'date' : 'text';
  if (cal) cal.value = b.dataset.cal!;
}));

/* preselect package from ?package=Name links */
const wanted = new URLSearchParams(location.search).get('package');
const pkgSelect = $<HTMLSelectElement>('select[name=package]');
if (wanted && pkgSelect) {
  const opt = [...pkgSelect.options].find((o) => o.value.toLowerCase() === wanted.toLowerCase());
  if (opt) pkgSelect.value = opt.value;
}

/* inquiry forms */
const SKIP = new Set(['access_key', 'subject', 'website']);

/** The form's answers as "field: value" lines for a WhatsApp message. */
function summarise(data: FormData): string[] {
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
  return lines;
}

$$<HTMLFormElement>('form[data-form]').forEach((f) => f.addEventListener('submit', async (e) => {
  e.preventDefault();
  if ((f.elements.namedItem('website') as HTMLInputElement | null)?.value) return; // bot trap
  f.querySelector('[type=submit]')?.classList.add('loading');
  const data = new FormData(f);
  const thanks = f.dataset.thanks || '/thank-you/';
  if (f.dataset.endpoint) {
    try {
      const res = await fetch(f.dataset.endpoint, { method: 'POST', body: data, headers: { Accept: 'application/json' } });
      if (res.ok) { location.href = thanks; return; }
    } catch { /* fall through to WhatsApp */ }
  }
  const text = `Namaste Vibeshots! ${f.dataset.form} from the website:\n\n${summarise(data).join('\n')}`;
  const url = waUrl(f.dataset.wa || '', text);
  const win = window.open(url, '_blank');
  if (win) { win.opener = null; location.href = thanks; } else { location.href = url; }
}));
