// Writes a 900px "-sm.webp" copy next to every WebP in site/public/uploads,
// used by Media.astro's srcset so phones and small cards load light files.
// Usage: node make-small.mjs
import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';

const dir = path.resolve('../site/public/uploads');
let n = 0, kb = 0;
async function walk(d) {
  for (const e of await fs.readdir(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) await walk(p);
    else if (e.name.endsWith('.webp') && !e.name.endsWith('-sm.webp')) {
      const out = p.replace(/\.webp$/, '-sm.webp');
      const info = await sharp(p).resize(900, 900, { fit: 'inside', withoutEnlargement: true }).webp({ quality: 72 }).toFile(out);
      n++; kb += info.size / 1024;
    }
  }
}
await walk(dir);
console.log(`${n} small copies, ${(kb / 1024).toFixed(1)} MB`);
