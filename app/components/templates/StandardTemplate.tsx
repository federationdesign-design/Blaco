import blocks from '../blocks/Blocks.module.css';
import { Sections } from '../blocks/Sections';
import { FaqIndexSchema } from '../StructuredData';
import type { Page } from '../../lib/content';

// Home, listing, general content, policy, accessibility, contact and the two
// index templates. They share one section renderer; each section kind carries
// its own mobile layout, and data-template leaves room for per-template styling.
export function StandardTemplate({ page }: { page: Page }) {
  const postsCategory = page.template === 'faq-index' ? 'faq' : page.template === 'testimonial-index' ? 'testimonial' : undefined;
  // Checkpoint 5 decision 2: text-heavy pages limit their text column to a
  // reading measure; the layout, backgrounds and images stay full width.
  const textHeavy = page.template === 'policy' || page.template === 'accessibility' || page.url === '/modern-slavery';
  return (
    <div data-template={page.template} className={textHeavy ? blocks.measured : undefined}>
      {page.template === 'faq-index' && <FaqIndexSchema />}
      <Sections sections={page.sections ?? []} postsCategory={postsCategory} />
    </div>
  );
}
