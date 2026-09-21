import type { MetadataRoute } from 'next';
import { getIndex } from './lib/content';

const SITE = 'https://blacohillcottages.co.uk';

// Every ported page plus /modern-slavery. Redirected URLs are left out.
export default function sitemap(): MetadataRoute.Sitemap {
  return getIndex().map((entry) => ({
    url: entry.url === '/' ? SITE : `${SITE}${entry.url}`,
    changeFrequency: entry.template === 'post' ? 'yearly' : 'monthly',
    priority: entry.url === '/' ? 1 : entry.template === 'cottage' || entry.template === 'listing' ? 0.8 : 0.5,
  }));
}
