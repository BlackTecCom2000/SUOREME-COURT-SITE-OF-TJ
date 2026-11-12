/**
 * One-off/standalone compression pass over the archive media library.
 *
 * Wikimedia serves fixed anonymous thumbnail buckets (960/1280 px) and the
 * originals are high-quality JPEGs of 0.4-1 MB — far too heavy for a page
 * that loads several of them. Every file is re-encoded locally with sharp
 * (mozjpeg, quality 78) and PNG sources become JPEG, which alone cut the
 * 1968 stamp from 500 KB to a fraction of that.
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const dir = path.join('data', 'uploads', 'portraits');

for (const entry of fs.readdirSync(dir)) {
  const file = path.join(dir, entry);
  const before = fs.statSync(file).size;
  const base = entry.replace(/\.(png|jpe?g|webp|gif)$/i, '');

  let img = sharp(file);
  const meta = await img.metadata();
  if ((meta.width || 0) > 1280) img = img.resize({ width: 1280, withoutEnlargement: true });

  const out = path.join(dir, `${base}.jpg`);
  const tmp = `${out}.tmp`;
  await img.jpeg({ quality: 78, mozjpeg: true }).toFile(tmp);
  fs.rmSync(file, { force: true });
  fs.renameSync(tmp, out);

  const after = fs.statSync(out).size;
  if (after < before || out !== file) {
    console.log(
      `${entry.padEnd(28)} -> ${path.basename(out).padEnd(28)} ` +
        `${Math.round(before / 1024)}KB -> ${Math.round(after / 1024)}KB`
    );
  }
}
