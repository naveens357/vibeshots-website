// One-off: writes real stories, pre-weddings, projects, films, home, images
// wall, ceremony and journal covers from out/processed.json.
// Sample entries that these replace are deleted.
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const root = path.resolve('..');
const site = path.join(root, 'site');
const P = JSON.parse(fs.readFileSync('out/processed.json', 'utf8'));
const s = (v) => JSON.stringify(v);

// --- captions from gallery.json (alt text) ---
const captions = {};
for (const d of fs.readdirSync(path.join(root, 'photo'))) {
  const g = path.join(root, 'photo', d, 'gallery.json');
  if (!fs.existsSync(g)) continue;
  const j = JSON.parse(fs.readFileSync(g, 'utf8'));
  for (const [file, v] of Object.entries(j.photos || {})) captions[`photo/${d}/${file}`] = v;
}
const alt = (e, fallback) => captions[e.src]?.alt || fallback;

// --- capture date from EXIF (first photo of a set) ---
async function shotDate(src) {
  try {
    const m = await sharp(path.join(root, src)).metadata();
    const hit = m.exif && m.exif.toString('latin1').match(/(20\d\d):(\d\d):(\d\d) \d\d:\d\d:\d\d/);
    if (hit) return `${hit[1]}-${hit[2]}-${hit[3]}`;
  } catch {}
  return null;
}
// Approximate Bikram Sambat month for an AD date (month starts vary by a day or two).
const bsStarts = [[1, 15, 'Magh'], [2, 13, 'Falgun'], [3, 15, 'Chaitra'], [4, 14, 'Baisakh'], [5, 15, 'Jestha'], [6, 15, 'Asar'], [7, 17, 'Shrawan'], [8, 17, 'Bhadra'], [9, 17, 'Asoj'], [10, 18, 'Kartik'], [11, 17, 'Mangsir'], [12, 16, 'Poush']];
function toBS(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  let name = 'Poush';
  for (const [mm, dd, n] of bsStarts) if (m > mm || (m === mm && d >= dd)) name = n;
  const afterNewYear = m > 4 || (m === 4 && d >= 14);
  return `${name} ${y + (afterNewYear ? 57 : 56)}`;
}

// --- gallery layout: landscapes full width, portraits in rows of 2 or 3 ---
function layout(entries) {
  const out = [];
  let run = [];
  const flush = (next) => {
    let n = run.length;
    const take = (k, l) => { for (let i = 0; i < k; i++) out.push({ ...run.shift(), layout: l }); n -= k; };
    while (n > 0) {
      if (n === 1) take(1, 'center'); // a lone portrait sits centred on its own
      else if (n === 2 || n === 4) take(2, 'half');
      else take(3, 'third');
    }
  };
  for (const e of entries) {
    if (e.orient === 'land') {
      const item = { ...e, layout: 'full' };
      flush(item);
      out.push(item);
    } else run.push(e);
  }
  flush(null);
  return out;
}

function yamlList(key, arr) {
  if (!arr.length) return `${key}: []\n`;
  return `${key}:\n` + arr.map((o) => Object.entries(o).map(([k, v], i) => `  ${i ? ' ' : '-'} ${k}: ${typeof v === 'string' ? s(v) : v}`).join('\n')).join('\n') + '\n';
}
function writeMd(dir, slug, fm, lists, body) {
  let y = '';
  for (const [k, v] of Object.entries(fm)) y += Array.isArray(v) ? (v.length ? `${k}:\n${v.map((x) => `  - ${s(x)}`).join('\n')}\n` : `${k}: []\n`) : `${k}: ${typeof v === 'string' ? s(v) : v}\n`;
  for (const [k, v] of Object.entries(lists)) y += yamlList(k, v);
  fs.mkdirSync(path.join(site, 'src/content', dir), { recursive: true });
  fs.writeFileSync(path.join(site, 'src/content', dir, `${slug}.md`), `---\n${y}---\n\n${body.trim()}\n`);
}
const pick = (group, ref) => P[group].entries.find((e) => e.ref === ref);
const gallery = (group, fallbackAlt) => layout(P[group].entries).map((e) => ({ src: e.url, alt: alt(e, fallbackAlt), tone: 'ivory', label: '', layout: e.layout }));

// --- remove samples ---
for (const dir of ['stories', 'projects', 'prewedding', 'films']) {
  const d = path.join(site, 'src/content', dir);
  for (const f of fs.readdirSync(d)) {
    const t = fs.readFileSync(path.join(d, f), 'utf8');
    if (/\nsample: true/.test(t)) fs.unlinkSync(path.join(d, f));
  }
}

// --- wedding stories ---
const stories = [
  { slug: 'biwash-swastika', title: 'Biwash & Swastika', headline: 'Red at the Window', venue: 'Kathmandu Valley', ceremonies: ['Getting ready', 'Wedding', 'Reception'],
    excerpt: 'Morning light through the curtains, a groom in daura suruwal and a red topi, and a second look for the reception.',
    body: `Swastika got ready by a tall window, and the soft light did half our work: red silk, gold and a veil that glowed every time she turned. Biwash waited downstairs in a white daura suruwal and a red topi, and their first look on the staircase was the moment the whole family had been waiting for.\n\nLater the colours changed for the reception, a deep red lehenga and a navy suit, but the two of them stayed exactly the same: easy, laughing and completely themselves.` },
  { slug: 'nick-ganga', title: 'Nick & Ganga', headline: 'Two Worlds, One Vow', venue: 'Universal Receptions', ceremonies: ['Wedding', 'Tika', 'Reception'], film: '/uploads/films/nick-ganga-highlight.mp4', filmLength: '2:45',
    excerpt: 'A Nepali wedding with a groom from far away: red saree, arched windows and a family welcoming Nick home.',
    body: `Ganga in red and gold, Nick in a dhaka topi he wore with real pride, and Universal Receptions dressed in marigolds and red silk. From the balcony portraits under the arched windows to the tika with both families, it was a day of two worlds meeting halfway.\n\nWatch their highlight film above, and scroll through the day below.` },
  { slug: 'sonam-rina', title: 'Sonam & Rina', headline: 'The Grand Staircase', venue: 'Kathmandu Valley', ceremonies: ['Reception'],
    excerpt: 'A white palace of a venue, sweeping red staircases and a couple who owned every step.',
    body: `Sonam and Rina's reception venue looked like a palace, with white columns and two staircases wrapped in red. They walked in to their own welcome sign, and every step on those stairs became a portrait.\n\nInside, the stage glowed gold and Rina's red veil caught every light in the room.` },
  { slug: 'manish', title: 'Manish', headline: 'Rainbow on the Rooftop', venue: 'Kathmandu Valley', ceremonies: ['Mehendi', 'Wedding'],
    excerpt: 'A mehendi under a rooftop rainbow with painted umbrellas, then quiet portraits in red on the wedding day.',
    body: `The mehendi happened on a rooftop just as a rainbow broke over the hills, so out came the painted umbrellas, the cousins and a lot of laughing.\n\nOn the wedding day we slowed right down: red saree, pote and a soft grey suit, with close portraits of hands, rings and the small looks between them.` },
];
for (const st of stories) {
  const g = `stories/${st.slug}`;
  const first = P[g].entries[0];
  const date = (await shotDate(first.src)) || '2026-01-01';
  const cover = pick(g, P[g].cover), hero = pick(g, P[g].hero);
  writeMd('stories', st.slug, {
    title: st.title, headline: st.headline, date, dateBS: toBS(date), venue: st.venue, city: '', community: '',
    ceremonies: st.ceremonies, package: '', team: '', excerpt: st.excerpt,
    cover: cover.url, coverAlt: `${st.title} wedding`, coverTone: 'bride', coverLabel: '',
    hero: hero.url, film: st.film || '', filmPoster: st.film ? hero.url : '', filmLength: st.filmLength || '', quote: '',
    featured: true, sample: false,
  }, { gallery: gallery(g, `${st.title} wedding`), vendors: [] }, st.body);
  console.log('story', st.slug, date, toBS(date));
}

// --- pre-weddings ---
const pre = [
  { slug: 'sumnima-patan', title: 'Sumnima', location: 'Patan Durbar Square', excerpt: 'A red veil flowing through the arcades of Patan Durbar Square on a grey monsoon day.' },
  { slug: 'sabin-patan', title: 'Sabin', location: 'Patan', excerpt: 'Brick courtyards, carved windows and a red saree, in Patan’s quietest corners.' },
  { slug: 'abhisek-bhaktapur', title: 'Abhisek', location: 'Bhaktapur', excerpt: 'Chiya in the lanes, temple steps and a silhouette against Nyatapola, at home in Bhaktapur.' },
  { slug: 'anu-bhaktapur', title: 'Anu', location: 'Bhaktapur', excerpt: 'Old streets, two hearts: carved windows, mask shops and golden light.' },
  { slug: 'bikash-garden', title: 'Bikash', location: 'Kathmandu Valley', excerpt: 'All in white in a garden full of marigolds, with sun-flare portraits at golden hour.' },
  { slug: 'ricky', title: 'Ricky', location: 'Kathmandu Valley', excerpt: 'Before the vows: a red lehenga, brick arches and a lot of laughter.' },
  { slug: 'bandana-engagement', title: 'Bandana', location: 'Kathmandu Valley', excerpt: 'An engagement in purple and gold, among green gardens and white walls.' },
];
for (const p of pre) {
  const g = `prewedding/${p.slug}`;
  const date = (await shotDate(P[g].entries[0].src)) || '2026-01-01';
  const cover = pick(g, P[g].cover);
  writeMd('prewedding', p.slug, {
    title: p.title, location: p.location, date, excerpt: p.excerpt,
    cover: cover.url, coverAlt: `${p.title} pre-wedding shoot in ${p.location}`, coverTone: 'ivory', coverLabel: '', sample: false,
  }, { gallery: gallery(g, `${p.title} pre-wedding shoot`) }, p.excerpt);
  console.log('pre', p.slug, date);
}

// --- commercial projects ---
const projects = [
  { slug: 'race-day-august-2025', title: 'Race day, August', client: 'Bike race', credit: 'Track coverage: corners, line-ups and pit lane', sector: 'moto', types: ['stills'], location: 'Kathmandu', deliverables: 'Edited race stills', body: '## The day\nA full day trackside: riders leaning into the corners, the line-up before the flag and the bikes waiting in the pit lane.' },
  { slug: 'motor-sports-nepal-april-2026', title: 'Bike race, April', client: 'Motor Sports Nepal Club', credit: 'Motor Sports Nepal Club × Vibeshots', sector: 'moto', types: ['stills'], location: 'Kathmandu', deliverables: 'Race stills, branded for the club', body: '## The brief\nCover the race for Motor Sports Nepal Club, from wheel-to-wheel corners to the chequered flag and the victory lap.' },
  { slug: 'phoksundo-lake-trek', title: 'Turquoise lake, thin air', client: 'Phoksundo, Dolpa', credit: 'A travel story from Shey Phoksundo', sector: 'travel', types: ['stills'], location: 'Shey Phoksundo, Dolpa', deliverables: 'Travel and documentary stills', body: '## The trek\nVillages under the peaks, monks at prayer, horsemen on the cliff paths and the lake itself, impossibly turquoise. A story told in landscapes and faces.' },
  { slug: 'himalaya-on-foot', title: 'Himalaya, on foot', client: 'Langtang trek', credit: 'Trekkers, porters and prayer flags', sector: 'travel', types: ['stills'], location: 'Langtang', deliverables: 'Travel stills', body: '## The trek\nArms open below the snow peaks, prayer flags in the wind and the porters who make it all possible.' },
];
for (const pr of projects) {
  const g = `projects/${pr.slug}`;
  const date = (await shotDate(P[g].entries[0].src)) || '2026-01-01';
  const cover = pick(g, P[g].cover);
  writeMd('projects', pr.slug, {
    title: pr.title, client: pr.client, credit: pr.credit, sector: pr.sector, types: pr.types, date, location: pr.location,
    deliverables: pr.deliverables, results: '', cover: cover.url, coverAlt: alt(cover, pr.title), coverTone: 'moto', coverLabel: '',
    film: '', featured: true, sample: false,
  }, { gallery: gallery(g, pr.title) }, pr.body);
  console.log('project', pr.slug, date);
}

// --- films ---
const gangaHero = pick('stories/nick-ganga', P['stories/nick-ganga'].hero);
writeMd('films', 'nick-ganga-highlight', {
  title: 'Nick & Ganga', subtitle: 'Highlight film', kind: 'highlight', url: '/uploads/films/nick-ganga-highlight.mp4',
  poster: gangaHero.url, posterTone: 'bride', date: '2026-10-25', dateBS: '', venue: 'Universal Receptions', length: '2:45', story: 'nick-ganga', sample: false,
}, {}, '');

// --- home ---
const home = JSON.parse(fs.readFileSync(path.join(site, 'src/data/home.json'), 'utf8'));
const H = P.home.entries;
await sharp('out/hero-poster.jpg').webp({ quality: 78 }).toFile(path.join(site, 'public/uploads/home/hero-poster.webp'));
home.heroImage = '/uploads/home/hero-poster.webp';
home.heroVideo = '/uploads/home/hero-loop.mp4';
home.blocks[0].image = H[1].url; home.blocks[1].image = H[2].url; home.blocks[2].image = H[3].url;
home.filmsImage = H[4].url; home.commercialImage = H[5].url;
fs.writeFileSync(path.join(site, 'src/data/home.json'), JSON.stringify(home, null, 2) + '\n');

// --- site settings ---
const sitej = JSON.parse(fs.readFileSync(path.join(site, 'src/data/site.json'), 'utf8'));
sitej.heroCommercialPoster = H[5].url;
sitej.officialLine = 'Motorsport · Travel · Brands';
sitej.clients = ['Motor Sports Nepal Club'];
fs.writeFileSync(path.join(site, 'src/data/site.json'), JSON.stringify(sitej, null, 2) + '\n');

// --- images wall ---
const ratio = (e) => (e.orient === 'land' ? '32' : e.orient === 'square' ? '11' : '23');
const imgs = JSON.parse(fs.readFileSync(path.join(site, 'src/data/images.json'), 'utf8'));
imgs.images = P.images.entries.map((e) => ({ src: e.url, alt: alt(e, 'Wedding photograph by Vibeshots Nepal'), tone: 'ivory', ratio: ratio(e), label: '' }));
fs.writeFileSync(path.join(site, 'src/data/images.json'), JSON.stringify(imgs, null, 2) + '\n');

// --- ceremony + journal covers ---
const setCover = (file, url, altText) => {
  let t = fs.readFileSync(file, 'utf8');
  t = t.replace(/^cover: .*$/m, `cover: ${s(url)}`).replace(/^coverAlt: .*$/m, `coverAlt: ${s(altText)}`);
  fs.writeFileSync(file, t);
};
const C = P.ceremonies.entries;
const cdir = path.join(site, 'src/content/ceremonies');
[['mehendi', 0, 'Mehendi day on a rooftop with painted umbrellas'], ['engagement', 1, 'Engagement portrait in purple and gold'], ['reception', 2, 'Bride and groom on the reception stage'], ['pre-wedding', 3, 'Couple silhouetted against Nyatapola temple in Bhaktapur'], ['janti', 4, 'Groom in daura suruwal and red topi on the stairs']]
  .forEach(([slug, i, a]) => setCover(path.join(cdir, `${slug}.md`), C[i].url, a));
const J = P.journal.entries;
const jdir = path.join(site, 'src/content/journal');
[['pre-wedding-locations-bhaktapur', 0, 'Couple in the old streets of Bhaktapur'], ['haldi-mehendi-photo-checklist', 1, 'Friends with painted umbrellas at a mehendi'], ['wedding-day-timeline', 2, 'Bride getting ready by the window']]
  .forEach(([slug, i, a]) => setCover(path.join(jdir, `${slug}.md`), J[i].url, a));
console.log('done');
