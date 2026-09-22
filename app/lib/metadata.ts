import type { Metadata } from 'next';
import { SITE_NAME, SITE_URL, TITLE_SUFFIX } from './site';
import type { Page } from './content';

// One place that builds a page's head tags, so the title, the canonical, the
// description and the social tags can never drift apart (agent/SEO.md).
//
// og:title is the whole document title, suffix included, so a shared link reads
// the same as the browser tab. og:description and the meta description are the
// same approved sentence, used exactly as written.

export function pageMetadata(page: Page): Metadata {
  const title = page.absoluteTitle ?? `${page.title} | ${TITLE_SUFFIX}`;
  const url = page.url === '/' ? SITE_URL : `${SITE_URL}${page.url}`;
  const image = {
    url: `${SITE_URL}${page.share.src}`,
    width: page.share.width,
    height: page.share.height,
    alt: page.share.alt || SITE_NAME,
  };

  return {
    title: page.absoluteTitle ? { absolute: page.absoluteTitle } : page.title,
    description: page.description,
    alternates: { canonical: page.url },
    openGraph: {
      type: 'website',
      siteName: SITE_NAME,
      locale: 'en_GB',
      title,
      description: page.description,
      url,
      images: [image],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: page.description,
      images: [image],
    },
  };
}
