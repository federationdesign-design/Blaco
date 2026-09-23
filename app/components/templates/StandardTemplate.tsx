import blocks from '../blocks/Blocks.module.css';
import { Sections } from '../blocks/Sections';
import { FaqIndexSchema } from '../StructuredData';
import type { Page } from '../../lib/content';

// Home, listing, general content, policy, accessibility, contact and the two
// index templates. They share one section renderer; each section kind carries
// its own mobile layout, and data-template leaves room for per-template styling.
export function StandardTemplate({ page }: { page: Page }) {
  const postsCategory = page.template === 'faq-index' ? 'faq' : page.template === 'testimonial-index' ? 'testimonial' : undefined;
  // Text-heavy pages set their text column at 90% of the page width, centred
  // (agent/DECISIONS.md, "Text column: 90% of the page width").
  const textHeavy = page.template === 'policy' || page.template === 'accessibility' || page.url === '/modern-slavery';
  return (
    <div data-template={page.template} className={textHeavy ? blocks.textHeavy : undefined}>
      {page.template === 'faq-index' && <FaqIndexSchema />}
      <Sections sections={page.sections ?? []} postsCategory={postsCategory} />
    </div>
  );
}
