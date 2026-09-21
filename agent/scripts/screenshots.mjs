// Screenshots and layout checks against a running build.
// Usage: npm run build && npx next start -p 3100, then npm run screenshots
import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const BASE = process.env.BASE_URL ?? 'http://localhost:3100';
const out = join(dirname(fileURLToPath(import.meta.url)), '..', 'screenshots');
await mkdir(out, { recursive: true });

const browser = await chromium.launch();
const problems = [];

const page = async (width, height = 900) => {
  const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 2 });
  const p = await context.newPage();
  await p.goto(`${BASE}/`, { waitUntil: 'load' });
  await p.evaluate(() => document.fonts.ready);
  return p;
};

// Overflow check across the supported range.
for (const width of [360, 390, 768, 1024, 1280, 1440, 2800]) {
  const p = await page(width);
  const overflow = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  if (overflow > 0) problems.push(`horizontal overflow of ${overflow}px at ${width}px`);
  await p.context().close();
}

// Touch targets in the shell.
for (const width of [390, 1280]) {
  const p = await page(width);
  const small = await p.evaluate(() =>
    [...document.querySelectorAll('header a, header button, footer a')]
      .filter((el) => el.getClientRects().length && getComputedStyle(el).visibility !== 'hidden')
      .filter((el) => !el.matches('[class*="skipLink"]'))
      .map((el) => ({ el, r: el.getBoundingClientRect() }))
      .filter(({ r }) => r.width < 44 || r.height < 44)
      .map(({ el, r }) => `${el.textContent.trim() || el.getAttribute('aria-label') || el.tagName} ${Math.round(r.width)}x${Math.round(r.height)}`),
  );
  small.forEach((s) => problems.push(`touch target under 44px at ${width}px: ${s}`));
  await p.context().close();
}

// 390px: shell, then menu open.
{
  const p = await page(390, 844);
  await p.screenshot({ path: join(out, 'shell-390.png'), fullPage: true });
  await p.getByRole('button', { name: 'Menu' }).click();
  await p.screenshot({ path: join(out, 'shell-390-menu-open.png') });
  await p.keyboard.press('Escape');
  const closed = await p.locator('#mobile-menu').isHidden();
  if (!closed) problems.push('mobile menu did not close on Escape');
  await p.context().close();
}

// 1280px: shell, then a submenu opened by click.
{
  const p = await page(1280, 900);
  await p.screenshot({ path: join(out, 'shell-1280.png'), fullPage: true });
  await p.getByRole('button', { name: 'Our Cottages submenu' }).click();
  await p.mouse.move(1270, 890);
  await p.waitForTimeout(400);
  await p.screenshot({ path: join(out, 'shell-1280-submenu-open.png') });
  await p.context().close();
}

await browser.close();
console.log(problems.length ? problems.join('\n') : 'No layout problems found.');
process.exitCode = problems.length ? 1 : 0;
