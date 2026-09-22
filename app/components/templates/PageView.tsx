import { CottageTemplate } from './CottageTemplate';
import { PostTemplate } from './PostTemplate';
import { StandardTemplate } from './StandardTemplate';
import type { Page } from '../../lib/content';

export function PageView({ page }: { page: Page }) {
  if (page.template === 'cottage' && page.cottage) return <CottageTemplate cottage={page.cottage} />;
  if (page.template === 'post' && page.post) return <PostTemplate post={page.post} url={page.url} />;
  return <StandardTemplate page={page} />;
}
