import Image from 'next/image';
import styles from './Blocks.module.css';
import { fitProps } from '../../lib/image-fit';
import type { Img } from '../../lib/content';

// Swipeable on phones (native scroll snap, no script), a grid from 768px.
export function Gallery({ images, label = 'Photo gallery' }: { images: Img[]; label?: string }) {
  return (
    <div className={styles.gallery} role="region" aria-label={label} tabIndex={0}>
      <ul className={styles.galleryTrack}>
        {images.map((image, i) => (
          <li key={`${image.src}-${i}`} className={styles.gallerySlide}>
            <Image
              src={image.src}
              alt={image.alt}
              width={image.width}
              height={image.height}
              sizes="(min-width: 1024px) 34vw, (min-width: 768px) 50vw, 88vw"
              {...fitProps('gallery', image.src)}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
