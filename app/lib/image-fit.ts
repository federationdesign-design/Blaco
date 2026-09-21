// Liquid layout decision 5, as amended at Checkpoint 5: an image is never
// enlarged more than 1.25x its original pixels. content/image-fit.json is written by agent/scripts/image-fit.mjs,
// which renders every page from 390px to 2800px and records, for each image in
// each role, the last viewport width at which it is within that limit. Such an
// image is served as its original file (no srcset, so its intrinsic size is its
// true size), and above that width globals.css shows it at natural size.
import FIT from '../../content/image-fit.json';

export type ImageRole = 'hero' | 'background' | 'slider' | 'gallery' | 'card' | 'figure' | 'map' | 'portrait';

type FitProps = { 'data-img': ImageRole; 'data-fit-from'?: number; unoptimized?: boolean };

// Home page decisions 1 and 3: home hero slides and every page hero always
// cover the full width, so they are exempt from the natural-size fallback and
// may be enlarged beyond 1.25x.
const EXEMPT: ImageRole[] = ['slider', 'hero'];

export function fitProps(role: ImageRole, src: string): FitProps {
  if (EXEMPT.includes(role)) return { 'data-img': role };
  const from = (FIT as Record<string, number>)[`${role}|${src}`];
  return from === undefined ? { 'data-img': role } : { 'data-img': role, 'data-fit-from': from, unoptimized: true };
}

// next/image sizes for a content image in a column of the given live width.
// Phones: full width. 768px: most columns pair up. 1024px and up: the column's
// share of the viewport, with no upper limit so large screens get large files.
const SHARE: Record<string, number> = { '4_4': 100, '3_4': 75, '2_3': 67, '3_5': 60, '1_2': 50, '2_5': 40, '1_3': 34, '1_4': 25, '1_6': 17 };

export function columnSizes(size = '4_4') {
  const tablet = size === '4_4' ? 100 : size === '1_6' ? 34 : 50;
  return `(min-width: 1024px) ${SHARE[size] ?? 100}vw, (min-width: 768px) ${tablet}vw, 100vw`;
}
