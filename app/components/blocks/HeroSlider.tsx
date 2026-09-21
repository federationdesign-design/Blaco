'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import styles from './Blocks.module.css';
import { fitProps } from '../../lib/image-fit';
import type { Slide } from '../../lib/content';

// Home page hero. The live slides share one heading, so it is shown once over
// swipeable photos. No autoplay; the dots and a swipe change the photo.
export function HeroSlider({ slides }: { slides: Slide[] }) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(0);
  const first = slides[0];

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(Number((entry.target as HTMLElement).dataset.index));
        }
      },
      { root: track, threshold: 0.6 },
    );
    track.querySelectorAll('li').forEach((li) => observer.observe(li));
    return () => observer.disconnect();
  }, []);

  const go = (index: number) => {
    const track = trackRef.current;
    track?.scrollTo({ left: index * track.clientWidth, behavior: 'smooth' });
  };

  return (
    <section className={styles.slider} aria-roledescription="carousel" aria-label="Blaco Hill Farm photos">
      <ul ref={trackRef} className={styles.sliderTrack}>
        {slides.map((slide, i) =>
          slide.image ? (
            <li key={slide.image.src} className={styles.sliderSlide} data-index={i} aria-roledescription="slide" aria-label={`${i + 1} of ${slides.length}`}>
              <Image
                src={slide.image.src}
                alt={slide.image.alt}
                fill
                sizes="100vw"
                priority={i === 0}
                {...fitProps('slider', slide.image.src)}
              />
            </li>
          ) : null,
        )}
      </ul>
      <div className={styles.sliderText}>
        <h1 className={styles.sliderTitle}>{first.title}</h1>
        <p className={styles.sliderSub} dangerouslySetInnerHTML={{ __html: first.html }} />
      </div>
      {slides.length > 1 && (
        <div className={styles.sliderDots}>
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              className={styles.sliderDot}
              aria-label={`Show photo ${i + 1}`}
              aria-current={active === i ? 'true' : undefined}
              onClick={() => go(i)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
