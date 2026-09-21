import styles from './Blocks.module.css';

// Copy ported from WordPress. The HTML is generated at build time by
// agent/scripts/build-content.mjs from the site's own content, not user input.
export function RichText({ html, className, as: Tag = 'div' }: { html: string; className?: string; as?: 'div' | 'blockquote' }) {
  if (!html) return null;
  return <Tag className={className ? `${styles.prose} ${className}` : styles.prose} dangerouslySetInnerHTML={{ __html: html }} />;
}
