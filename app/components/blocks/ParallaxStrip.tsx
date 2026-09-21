'use client';

import { useEffect, useRef } from 'react';
import styles from './Blocks.module.css';
import { BackgroundImage } from './BackgroundImage';
import type { Background } from '../../lib/content';

// Home page decision 2: the landscape strip moves more slowly than the page.
// Transform based, so it works on iPhone Safari (which ignores
// background-attachment: fixed). The image layer is taller than the strip and
// is shifted by up to that overscan as the strip crosses the viewport. It only
// runs while the strip is on screen, and not at all with reduced motion.
export function ParallaxStrip({ background }: { background: Background | null }) {
  const stripRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const strip = stripRef.current;
    const layer = layerRef.current;
    if (!strip || !layer) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    let visible = false;

    const update = () => {
      frame = 0;
      const rect = strip.getBoundingClientRect();
      const view = window.innerHeight;
      // 0 as the strip enters at the bottom, 1 as it leaves at the top.
      const progress = Math.min(1, Math.max(0, (view - rect.top) / (view + rect.height)));
      // The layer overhangs the strip by --parallax-overscan top and bottom.
      const overscan = (layer.offsetHeight - strip.offsetHeight) / 2;
      layer.style.transform = `translate3d(0, ${((progress - 0.5) * 2 * overscan).toFixed(1)}px, 0)`;
    };
    const onScroll = () => {
      if (visible && !frame) frame = requestAnimationFrame(update);
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      onScroll();
    });

    const start = () => {
      observer.observe(strip);
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll);
      update();
    };
    const stop = () => {
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      layer.style.transform = '';
    };
    const onPreference = () => (reduced.matches ? stop() : start());

    onPreference();
    reduced.addEventListener('change', onPreference);
    return () => {
      reduced.removeEventListener('change', onPreference);
      stop();
    };
  }, []);

  return (
    <div ref={stripRef} className={styles.parallax} aria-hidden="true">
      <div ref={layerRef} className={styles.parallaxLayer}>
        <BackgroundImage background={background} />
      </div>
    </div>
  );
}
