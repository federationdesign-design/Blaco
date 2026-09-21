import { Sections } from '../blocks/Sections';
import type { Page } from '../../lib/content';

// Home, listing, general content, policy, accessibility, contact and the two
// index templates. They share one section renderer; each section kind carries
// its own mobile layout, and data-template leaves room for per-template styling.
export function StandardTemplate({ page }: { page: Page }) {
  const postsCategory = page.template === 'faq-index' ? 'faq' : page.template === 'testimonial-index' ? 'testimonial' : undefined;
  return (
    <div data-template={page.template}>
      <Sections sections={page.sections ?? []} postsCategory={postsCategory} />
    </div>
  );
}
