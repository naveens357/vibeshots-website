// Turns the picks in selection.json into web-ready WebP files under
// site/public/uploads/<group>/, and writes out/processed.json with the
// published path, size and orientation of every photo.
// Usage: node process.mjs
import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve('..');
const sel = JSON.parse(await fs.readFile('selection.json', 'utf8'));
const exts = /\.(jpe?g|png|webp|heic|tiff?)$/i;
const LONG = 2000, HERO_LONG = 2560, QUALITY = 78;

async function list(dir) {
  const out = [];
  for (const e of await fs.readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...await list(p));
    else if (exts.test(e.name)) out.push(p);
  }
  return out.sort();
}

const setFiles = {};
for (const [k, dir] of Object.entries(sel.sets)) setFiles[k] = await list(path.join(root, dir));
const resolve = (ref) => {
  const [set, n] = ref.split(':');
  const f = setFiles[set]?.[Number(n) - 1];
  if (!f) throw new Error(`No photo for ${ref}`);
  return f;
};

const result = {};
const done = new Map(); // same source + size → reuse
for (const [group, g] of Object.entries(sel.groups)) {
  const outDir = path.join(root, 'site/public/uploads', group);
  await fs.mkdir(outDir, { recursive: true });
  const heroRefs = new Set([g.hero, g.cover].filter(Boolean));
  const entries = [];
  for (const [i, ref] of g.items.entries()) {
    const src = resolve(ref);
    const long = heroRefs.has(ref) || group === 'home' ? HERO_LONG : LONG;
    const name = `${String(i + 1).padStart(2, '0')}-${path.basename(src).replace(/\.[^.]+$/, '').replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.webp`;
    const out = path.join(outDir, name);
    const img = sharp(src, { failOn: 'none' }).rotate().resize(long, long, { fit: 'inside', withoutEnlargement: true });
    const info = await img.webp({ quality: QUALITY, effort: 5 }).toFile(out);
    entries.push({
      ref, src: path.relative(root, src).replace(/\\/g, '/'),
      url: `/uploads/${group}/${name}`,
      width: info.width, height: info.height,
      orient: info.width > info.height * 1.1 ? 'land' : info.height > info.width * 1.1 ? 'port' : 'square',
      kb: Math.round(info.size / 1024),
    });
    done.set(ref, entries.at(-1));
  }
  result[group] = { entries, cover: g.cover, hero: g.hero };
  const total = entries.reduce((s, e) => s + e.kb, 0);
  console.log(`${group}: ${entries.length} photos, ${(total / 1024).toFixed(1)} MB`);
}
await fs.mkdir('out', { recursive: true });
await fs.writeFile('out/processed.json', JSON.stringify(result, null, 2));
