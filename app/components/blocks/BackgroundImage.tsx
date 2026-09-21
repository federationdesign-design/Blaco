import Image from 'next/image';
import styles from './Blocks.module.css';
import { fitProps } from '../../lib/image-fit';
import type { Background } from '../../lib/content';

// Decorative section background. Shared by server sections and the client
// parallax strip, so it lives on its own without server-only imports.
export function BackgroundImage({ background, priority }: { background: Background | null; priority?: boolean }) {
  if (!background?.image) return null;
  return (
    <Image
      className={styles.bgImage}
      src={background.image.src}
      alt=""
      fill
      sizes="100vw"
      priority={priority}
      {...fitProps('background', background.image.src)}
    />
  );
}
