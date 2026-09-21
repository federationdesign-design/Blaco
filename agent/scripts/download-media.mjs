// Downloads every file in media-manifest.json to public/media/<yyyy>/<mm>/<file>.
// Always fetches from the live host over https; dev. is only a fallback.
import { readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const { media } = JSON.parse(await readFile(join(repo, 'agent', 'extract', 'media-manifest.json'), 'utf8'));
const failed = [];

const grab = async (upload) => {
  for (const host of ['https://blacohillcottages.co.uk', 'https://dev.blacohillcottages.co.uk', 'http://dev.blacohillcottages.co.uk']) {
    const res = await fetch(`${host}/wp-content/uploads/${encodeURI(upload)}`).catch(() => null);
    if (res?.ok && !(res.headers.get('content-type') || '').includes('text/html')) return Buffer.from(await res.arrayBuffer());
  }
  return null;
};

let bytes = 0;
for (const m of media) {
  const dest = join(repo, 'public', 'media', m.upload);
  if (await stat(dest).catch(() => null)) continue;
  const buf = await grab(m.upload);
  if (!buf) { failed.push(m.upload); continue; }
  await mkdir(dirname(dest), { recursive: true });
  await writeFile(dest, buf);
  bytes += buf.length;
}
console.log(`downloaded ${(bytes / 1e6).toFixed(1)} MB, failed: ${failed.length}`);
if (failed.length) console.log(failed.join('\n'));
