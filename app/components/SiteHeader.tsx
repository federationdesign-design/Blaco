import Image from 'next/image';
import Link from 'next/link';
import styles from './SiteHeader.module.css';
import { PrimaryNav } from './PrimaryNav';
import { MobileMenu } from './MobileMenu';
import { PhoneIcon } from './Icons';
import { CONTACT, ENQUIRE_HREF, LOGO, PRIMARY_NAV } from '../lib/site';

export function SiteHeader() {
  return (
    <header className={styles.header}>
      <a className={styles.skipLink} href="#main">
        Skip to content
      </a>
      <div className={styles.inner}>
        <Link href="/" className={styles.logo}>
          <Image src={LOGO.src} alt={LOGO.alt} width={LOGO.width} height={LOGO.height} priority unoptimized />
        </Link>

        <PrimaryNav items={PRIMARY_NAV} />

        <div className={styles.actions}>
          <a className={styles.call} href={CONTACT.phoneHref}>
            <PhoneIcon className={styles.callIcon} />
            <span className={styles.callLabel}>Call</span>
            <span className={styles.callNumber}>{CONTACT.phoneDisplay}</span>
          </a>
          <Link className={styles.enquire} href={ENQUIRE_HREF}>
            Enquire
          </Link>
          <MobileMenu items={PRIMARY_NAV} />
        </div>
      </div>
    </header>
  );
}
