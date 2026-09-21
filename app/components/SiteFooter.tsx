import Image from 'next/image';
import Link from 'next/link';
import styles from './SiteFooter.module.css';
import { MailIcon, PhoneIcon } from './Icons';
import { CookieSettingsLink } from './cookies/CookieBanner';
import {
  CONTACT,
  copyright,
  FOOTER_INFO_NAV,
  FOOTER_LEGAL_NAV,
  FOOTER_STRAPLINE,
  LOGO_WHITE,
  PRIMARY_NAV,
  type NavItem,
} from '../lib/site';

function FooterMenu({ items, label, variant, extra }: { items: NavItem[]; label: string; variant?: 'small'; extra?: React.ReactNode }) {
  return (
    <nav aria-label={label}>
      <ul className={variant === 'small' ? `${styles.menu} ${styles.menuSmall}` : styles.menu}>
        {items.map((item) => (
          <li key={item.label}>
            <Link href={item.href} className={styles.link}>
              {item.label}
            </Link>
          </li>
        ))}
        {extra && <li>{extra}</li>}
      </ul>
    </nav>
  );
}

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <FooterMenu items={PRIMARY_NAV} label="Footer" />

        <Link href="/" className={styles.logo}>
          <Image
            src={LOGO_WHITE.src}
            alt={`${LOGO_WHITE.alt} home`}
            width={LOGO_WHITE.width}
            height={LOGO_WHITE.height}
            unoptimized
          />
        </Link>

        <p className={styles.strapline}>{FOOTER_STRAPLINE}</p>

        <ul className={styles.contact}>
          <li>
            <a href={CONTACT.phoneHref} className={styles.contactLink}>
              <PhoneIcon className={styles.contactIcon} />
              {CONTACT.phoneDisplay}
            </a>
          </li>
          <li>
            <a href={CONTACT.emailHref} className={styles.contactLink}>
              <MailIcon className={styles.contactIcon} />
              {CONTACT.email}
            </a>
          </li>
        </ul>

        <FooterMenu items={FOOTER_INFO_NAV} label="Information" />
        <hr className={styles.rule} />
        <FooterMenu items={FOOTER_LEGAL_NAV} label="Legal" variant="small" extra={<CookieSettingsLink className={styles.link} />} />
        <hr className={styles.rule} />

        <p className={styles.copyright}>{copyright()}</p>
      </div>
    </footer>
  );
}
