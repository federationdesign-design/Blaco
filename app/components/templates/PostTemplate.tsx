import Link from 'next/link';
import styles from './PostTemplate.module.css';
import { RichText } from '../blocks/RichText';
import type { Post } from '../../lib/content';

// Shared detail template for FAQ and testimonial posts (decision 1). The live
// sidebar (search, recent posts, recent comments) is dropped (decision 8).
export function PostTemplate({ post }: { post: Post }) {
  const index = post.category === 'faq' ? { href: '/about/faq', label: 'FAQ' } : { href: '/about/testimonials', label: 'Testimonials' };
  return (
    <article className={styles.post} data-template="post">
      <header className={styles.header}>
        <p className={styles.kicker}>
          <Link href={index.href}>{index.label}</Link>
        </p>
        <h1>{post.title}</h1>
        <p className={styles.date}>{post.date}</p>
      </header>
      <RichText html={post.html} />
    </article>
  );
}
