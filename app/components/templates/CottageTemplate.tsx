import Image from 'next/image';
import styles from './CottageTemplate.module.css';
import blocks from '../blocks/Blocks.module.css';
import { BackgroundImage, ButtonLink, Highlights, ModuleView, Sections } from '../blocks/Sections';
import { RichText } from '../blocks/RichText';
import type { Cottage } from '../../lib/content';

// Cottage pages lead on mobile with the essentials (brief 5.10): name, rooms and
// sleeps, key features, then the availability action, before the description.
// From 1024px the live order returns: description beside features.
export function CottageTemplate({ cottage }: { cottage: Cottage }) {
  return (
    <div data-template="cottage">
      <section className={blocks.hero}>
        <div className={blocks.heroMedia} data-overlay={cottage.background?.overlay}>
          <BackgroundImage background={cottage.background} priority />
          <div className={blocks.heroInner}>
            <RichText html={cottage.heading} />
          </div>
        </div>
      </section>

      <section className={styles.intro}>
        <div className={styles.essentials}>
          <Highlights items={cottage.highlights} />
        </div>
        <div className={styles.features}>
          {cottage.features.map((m, i) => (
            <ModuleView key={i} module={m} />
          ))}
        </div>
        {cottage.action && (
          <div className={styles.action}>
            <ButtonLink module={cottage.action} />
          </div>
        )}
        <div className={styles.description}>
          {cottage.description.map((m, i) => (
            <ModuleView key={i} module={m} />
          ))}
        </div>
        <div className={styles.gallery}>
          {cottage.gallery.map((m, i) => (
            <ModuleView key={i} module={m} />
          ))}
          {cottage.map && (
            <figure className={styles.map}>
              <Image
                src={cottage.map.src}
                alt={cottage.map.alt}
                width={cottage.map.width}
                height={cottage.map.height}
                sizes="(min-width: 1280px) 1200px, 100vw"
              />
            </figure>
          )}
        </div>
      </section>

      <Sections sections={cottage.sections} />
    </div>
  );
}
