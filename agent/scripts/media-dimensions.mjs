// Records the pixel size of every file in public/media and public/maps into
// content/media.json, so next/image always gets real width and height. macOS sips.
import { execFileSync } from 'node:child_process';
import { readdirSync, statSync, writeFileSync, readFileSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const pub = join(repo, 'public');
const walk = (d) => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]));
const out = {};
for (const file of [...walk(join(pub, 'media')), ...walk(join(pub, 'maps'))]) {
  const key = '/' + relative(pub, file);
  if (file.endsWith('.svg')) {
    const vb = readFileSync(file, 'utf8').match(/viewBox="[\d.\s-]+?([\d.]+)\s+([\d.]+)"/);
    out[key] = { width: Math.round(Number(vb[1])), height: Math.round(Number(vb[2])) };
    continue;
  }
  const info = execFileSync('sips', ['-g', 'pixelWidth', '-g', 'pixelHeight', file], { encoding: 'utf8' });
  out[key] = { width: Number(info.match(/pixelWidth: (\d+)/)[1]), height: Number(info.match(/pixelHeight: (\d+)/)[1]) };
}
writeFileSync(join(repo, 'content', 'media.json'), JSON.stringify(out, null, 2));
console.log(`${Object.keys(out).length} files`);
