import Image from 'next/image';
import Link from 'next/link';
import styles from './Blocks.module.css';
import { RichText } from './RichText';
import { BlockIcon } from './BlockIcon';
import { Gallery } from './Gallery';
import { HeroSlider } from './HeroSlider';
import { EnquiryForm } from './EnquiryForm';
import { PostList } from './PostList';
import type { Background, BlurbModule, ButtonModule, Column, Module, Row, Section } from '../../lib/content';

// Renders the sections of a ported page. Each section kind has its own
// mobile-first layout; columns stack on phones and take their live widths
// from 1024px.

export function Sections({ sections, postsCategory }: { sections: Section[]; postsCategory?: 'faq' | 'testimonial' }) {
  return (
    <>
      {sections.map((section, i) => (
        <SectionView key={i} section={section} postsCategory={postsCategory} priority={i === 0} />
      ))}
    </>
  );
}

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
    />
  );
}

function SectionView({ section, postsCategory, priority }: { section: Section; postsCategory?: 'faq' | 'testimonial'; priority: boolean }) {
  if (section.kind === 'slider') {
    const slider = section.rows[0]?.columns[0]?.modules[0];
    return slider?.type === 'slider' ? <HeroSlider slides={slider.slides} /> : null;
  }

  if (section.kind === 'parallax') {
    return (
      <div className={styles.parallax} aria-hidden="true">
        <BackgroundImage background={section.background} />
      </div>
    );
  }

  if (section.kind === 'hero') {
    const [headingRow, ...rest] = section.rows;
    return (
      <section className={styles.hero}>
        <div className={styles.heroMedia} data-overlay={section.background?.overlay}>
          <BackgroundImage background={section.background} priority={priority} />
          <div className={styles.heroInner}>
            <Rows rows={[headingRow]} />
          </div>
        </div>
        {rest.map((row, i) => (
          <HeroRow key={i} row={row} />
        ))}
      </section>
    );
  }

  return (
    <section
      className={styles.section}
      data-kind={section.kind}
      data-overlay={section.background ? section.background.overlay : undefined}
    >
      <BackgroundImage background={section.background} />
      <div className={styles.inner}>
        <Rows rows={section.rows} postsCategory={postsCategory} />
      </div>
    </section>
  );
}

// The row under a page hero: highlight blurbs and the availability button.
function HeroRow({ row }: { row: Row }) {
  const modules = row.columns.flatMap((c) => c.modules);
  const blurbs = modules.filter((m): m is BlurbModule => m.type === 'blurb');
  const button = modules.find((m): m is ButtonModule => m.type === 'button');
  const other = modules.filter((m) => m.type !== 'blurb' && m.type !== 'button');
  return (
    <div className={styles.heroFacts}>
      {blurbs.length > 0 && <Highlights items={blurbs} />}
      {button && <ButtonLink module={button} />}
      {other.map((m, i) => (
        <ModuleView key={i} module={m} />
      ))}
    </div>
  );
}

export function Highlights({ items }: { items: BlurbModule[] }) {
  return (
    <ul className={styles.highlights}>
      {items.map((item) => (
        <li key={item.title} className={styles.highlight}>
          {item.icon && <BlockIcon name={item.icon} className={styles.highlightIcon} />}
          <span>{item.title}</span>
        </li>
      ))}
    </ul>
  );
}

export function Rows({ rows, postsCategory }: { rows: Row[]; postsCategory?: 'faq' | 'testimonial' }) {
  return (
    <>
      {rows.map((row, i) => (
        <div key={i} className={styles.row} data-shape={rowShape(row)}>
          {row.columns.map((column, j) => (
            <ColumnView key={j} column={column} postsCategory={postsCategory} />
          ))}
        </div>
      ))}
    </>
  );
}

// A few rows need their own layout, whatever their column sizes.
function rowShape(row: Row) {
  const modules = row.columns.flatMap((c) => c.modules);
  if (modules.every((m) => m.type === 'counter')) return 'counters';
  if (modules.every((m) => m.type === 'card')) return 'cards';
  if (modules.every((m) => m.type === 'testimonial')) return 'reviews';
  if (modules.every((m) => m.type === 'blurb')) return 'blurbs';
  if (modules.every((m) => m.type === 'toggle')) return 'toggles';
  return undefined;
}

function ColumnView({ column, postsCategory }: { column: Column; postsCategory?: 'faq' | 'testimonial' }) {
  return (
    <div className={styles.column} data-size={column.size}>
      {column.modules.map((module, i) => (
        <ModuleView key={i} module={module} postsCategory={postsCategory} />
      ))}
    </div>
  );
}

export function ButtonLink({ module }: { module: ButtonModule }) {
  return (
    <Link className={styles.button} href={module.href}>
      {module.label}
    </Link>
  );
}

export function ModuleView({ module, postsCategory }: { module: Module; postsCategory?: 'faq' | 'testimonial' }) {
  switch (module.type) {
    case 'text':
      return <RichText html={module.html} />;
    case 'button':
      return <ButtonLink module={module} />;
    case 'image': {
      if (!module.image) return null;
      const image = (
        <Image
          className={styles.image}
          src={module.image.src}
          alt={module.image.alt}
          width={module.image.width}
          height={module.image.height}
          sizes="(min-width: 1024px) 50vw, 100vw"
        />
      );
      return module.href ? (
        <Link className={styles.imageLink} href={module.href}>
          {image}
        </Link>
      ) : (
        <figure className={styles.figure}>{image}</figure>
      );
    }
    case 'blurb': {
      const title = module.href ? <a href={module.href}>{module.title}</a> : module.title;
      return (
        <div className={styles.blurb} data-icon={module.icon ?? undefined}>
          {module.icon && <BlockIcon name={module.icon} className={styles.blurbIcon} />}
          <div className={styles.blurbBody}>
            <h3 className={styles.blurbTitle}>{title}</h3>
            {module.html && <RichText html={module.html} />}
          </div>
        </div>
      );
    }
    case 'toggle':
      return (
        <details className={styles.toggle}>
          <summary className={styles.toggleTitle}>{module.title}</summary>
          <RichText html={module.html} className={styles.toggleBody} />
        </details>
      );
    case 'testimonial':
      return (
        <figure className={styles.testimonial}>
          <RichText html={module.html} as="blockquote" />
          <figcaption className={styles.testimonialAuthor}>
            {module.portrait && (
              <Image
                className={styles.portrait}
                src={module.portrait.src}
                alt=""
                width={60}
                height={60}
              />
            )}
            <span>{module.author}</span>
          </figcaption>
        </figure>
      );
    case 'form':
      return <EnquiryForm module={module} />;
    case 'counter':
      return (
        <div className={styles.counter}>
          <span className={styles.counterNumber}>{module.number}</span>
          <h3 className={styles.counterTitle}>{module.title}</h3>
        </div>
      );
    case 'gallery':
      return <Gallery images={module.images} />;
    case 'divider':
      return <hr className={styles.divider} />;
    case 'map':
      return (
        <p className={styles.mapLink}>
          <BlockIcon name="pin" className={styles.blurbIcon} />
          <a href={`https://www.google.com/maps?q=${module.lat},${module.lng}`} rel="noopener">
            {module.title}
          </a>
        </p>
      );
    case 'posts':
      return postsCategory ? <PostList category={postsCategory} /> : null;
    case 'card':
      return (
        <article className={styles.card}>
          {module.image && (
            <figure className={styles.cardImage}>
              <Image
                src={module.image.src}
                alt={module.image.alt}
                width={module.image.width}
                height={module.image.height}
                sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
              />
            </figure>
          )}
          <RichText html={module.html} className={styles.cardBody} />
          <Link className={styles.button} href={module.href}>
            {module.label}
          </Link>
        </article>
      );
    case 'slider':
      return <HeroSlider slides={module.slides} />;
  }
}
