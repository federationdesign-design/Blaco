import type { MetadataRoute } from 'next';
import { getIndex } from './lib/content';
import { SITE_URL } from './lib/site';

// Every ported page plus /modern-slavery. Redirected URLs are left out.
export default function sitemap(): MetadataRoute.Sitemap {
  return getIndex().map((entry) => ({
    url: entry.url === '/' ? SITE_URL : `${SITE_URL}${entry.url}`,
    changeFrequency: entry.template === 'post' ? 'yearly' : 'monthly',
    priority: entry.url === '/' ? 1 : entry.template === 'cottage' || entry.template === 'listing' ? 0.8 : 0.5,
  }));
}
