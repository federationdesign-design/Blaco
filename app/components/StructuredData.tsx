import { SITE_NAME, SITE_URL, CONTACT, LOGO } from '../lib/site';
import { getPosts } from '../lib/content';

// JSON-LD for search engines (agent/SEO.md). Everything here is built from
// content already in the repo: the business details come from app/lib/site.ts
// and the ported contact and privacy pages, and the questions and answers come
// from content/posts.json. Nothing is invented, and there are no ratings,
// because the ported testimonials carry no star ratings.

// Schema.org ids, so the graph can be joined up across pages rather than
// repeating the business on every one.
const BUSINESS_ID = `${SITE_URL}/#lodging`;

function JsonLd({ data }: { data: object }) {
  // The data is assembled here from repo content, never from user input.
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

// Rendered once in app/layout.tsx, so every page carries it. The @id lets the
// per-page blocks below point back at this one business.
export function LodgingBusinessSchema() {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'LodgingBusiness',
        '@id': BUSINESS_ID,
        name: SITE_NAME,
        url: SITE_URL,
        // Ported from the live contact and privacy pages.
        telephone: CONTACT.phoneHref.replace('tel:', ''),
        email: CONTACT.email,
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Blaco Hill Farm, Mattersey',
          addressLocality: 'Doncaster',
          addressRegion: 'South Yorkshire',
          postalCode: 'DN10 5HQ',
          addressCountry: 'GB',
        },
        // The pin the live contact page drops on Google Maps.
        geo: { '@type': 'GeoCoordinates', latitude: 53.384067496569, longitude: -0.95432686190186 },
        logo: `${SITE_URL}${LOGO.src}`,
        image: `${SITE_URL}/media/2021/02/blaco-hill-farm.jpg`,
      }}
    />
  );
}

// Strip the ported answer HTML back to text. Schema.org accepts limited markup
// in an answer, but plain text cannot carry anything the page does not show.
const text = (html: string) =>
  html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#8217;|&#8216;/g, '’')
    .replace(/&#8220;|&#8221;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();

const faqPage = (entries: { title: string; html: string }[], url: string) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  '@id': `${SITE_URL}${url}#faq`,
  isPartOf: { '@id': BUSINESS_ID },
  mainEntity: entries.map((entry) => ({
    '@type': 'Question',
    name: text(entry.title),
    acceptedAnswer: { '@type': 'Answer', text: text(entry.html) },
  })),
});

// The FAQ index at /about/faq: all 16 questions, in the order the page lists them.
export function FaqIndexSchema() {
  return <JsonLd data={faqPage(getPosts().faq, '/about/faq')} />;
}

// A single FAQ page, such as /do-you-have-wifi: the one question it answers.
export function FaqPostSchema({ title, html, url }: { title: string; html: string; url: string }) {
  return <JsonLd data={faqPage([{ title, html }], url)} />;
}
