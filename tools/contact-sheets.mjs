// Builds labelled thumbnail grids ("contact sheets") of every photo in the
// given folders, so a whole shoot can be reviewed at a glance.
// Usage: node contact-sheets.mjs <outDir> <folder> [<folder> ...]
import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';

const [outDir, ...folders] = process.argv.slice(2);
const COLS = 6, ROWS = 4, TW = 300, TH = 220, LABEL = 22, PAD = 6;
const exts = /\.(jpe?g|png|webp|heic|tiff?)$/i;

async function list(dir) {
  const out = [];
  for (const e of await fs.readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...await list(p));
    else if (exts.test(e.name)) out.push(p);
  }
  return out.sort();
}

const esc = (s) => s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

await fs.mkdir(outDir, { recursive: true });
for (const folder of folders) {
  const files = await list(folder);
  const name = path.basename(folder).replace(/\s+/g, '-');
  const per = COLS * ROWS;
  for (let s = 0; s * per < files.length; s++) {
    const chunk = files.slice(s * per, (s + 1) * per);
    const tiles = await Promise.all(chunk.map(async (f, i) => {
      const img = sharp(f, { failOn: 'none' }).rotate();
      const meta = await sharp(f, { failOn: 'none' }).metadata();
      const thumb = await img.resize(TW, TH, { fit: 'contain', background: '#222' }).jpeg({ quality: 70 }).toBuffer();
      const o = meta.orientation >= 5 ? 'P' : '';
      const dims = meta.orientation >= 5 ? `${meta.height}x${meta.width}` : `${meta.width}x${meta.height}`;
      const label = `${s * per + i + 1}. ${path.basename(f)} ${dims}${o}`;
      const svg = Buffer.from(`<svg width="${TW}" height="${LABEL}"><rect width="100%" height="100%" fill="#111"/><text x="4" y="16" font-family="Arial" font-size="13" fill="#fff">${esc(label.slice(0, 44))}</text></svg>`);
      return { thumb, svg, x: (i % COLS) * (TW + PAD), y: Math.floor(i / COLS) * (TH + LABEL + PAD) };
    }));
    const W = COLS * (TW + PAD), H = Math.ceil(chunk.length / COLS) * (TH + LABEL + PAD);
    const comps = tiles.flatMap((t) => [{ input: t.thumb, left: t.x, top: t.y }, { input: t.svg, left: t.x, top: t.y + TH }]);
    const out = path.join(outDir, `${name}-${s + 1}.jpg`);
    await sharp({ create: { width: W, height: H, channels: 3, background: '#000' } }).composite(comps).jpeg({ quality: 72 }).toFile(out);
    console.log(out, chunk.length);
  }
}
