import Image from 'next/image';
import styles from './Blocks.module.css';
import { fitProps, type ImageRole } from '../../lib/image-fit';
import type { Background } from '../../lib/content';

// Decorative section background. Shared by server sections and the client
// parallax strip, so it lives on its own without server-only imports.
// role 'hero' marks a page hero, which always covers the full width
// (home page decision 3); other backgrounds follow the 1.25x rule.
export function BackgroundImage({
  background,
  priority,
  role = 'background',
}: {
  background: Background | null;
  priority?: boolean;
  role?: Extract<ImageRole, 'background' | 'hero'>;
}) {
  if (!background?.image) return null;
  return (
    <Image
      className={styles.bgImage}
      src={background.image.src}
      alt=""
      fill
      sizes="100vw"
      priority={priority}
      {...fitProps(role, background.image.src)}
    />
  );
}
