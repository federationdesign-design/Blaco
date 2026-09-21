import Link from 'next/link';
import styles from './Blocks.module.css';
import { RichText } from './RichText';
import { getPosts } from '../../lib/content';

// FAQ and testimonial indexes. Each entry links to the post's own URL.
export function PostList({ category }: { category: 'faq' | 'testimonial' }) {
  const posts = getPosts()[category];
  return (
    <ul className={styles.postList}>
      {posts.map((post) => (
        <li key={post.url} className={styles.postItem}>
          <h2 className={styles.postTitle}>
            <Link href={post.url}>{post.title}</Link>
          </h2>
          <RichText html={post.html} />
        </li>
      ))}
    </ul>
  );
}
