import Link from 'next/link';
import styles from './components/templates/NotFound.module.css';

export default function NotFound() {
  return (
    <div className={styles.wrap}>
      <h1>Page not found</h1>
      <p>
        <Link href="/">Return to the home page</Link>
      </p>
    </div>
  );
}
