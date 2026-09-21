'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import styles from './MobileMenu.module.css';
import { CloseIcon, MailIcon, MenuIcon, PhoneIcon } from './Icons';
import { CONTACT, ENQUIRE_HREF, type NavItem } from '../lib/site';

// Full-screen menu below 1024px. It opens beneath the sticky header, so the
// logo, Call and Enquire actions stay visible while it is open.
export function MobileMenu({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    const root = document.documentElement;
    const outside = [document.getElementById('main'), document.querySelector('body > footer')];
    if (!open) return;

    root.setAttribute('data-menu-open', '');
    outside.forEach((el) => el?.setAttribute('inert', ''));
    panelRef.current?.querySelector<HTMLElement>('a')?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    // Close if the viewport grows into the desktop navigation.
    const desktop = window.matchMedia('(min-width: 1024px)');
    const onResize = () => desktop.matches && setOpen(false);
    document.addEventListener('keydown', onKey);
    desktop.addEventListener('change', onResize);

    return () => {
      root.removeAttribute('data-menu-open');
      outside.forEach((el) => el?.removeAttribute('inert'));
      document.removeEventListener('keydown', onKey);
      desktop.removeEventListener('change', onResize);
    };
  }, [open]);

  const current = (href: string) => (pathname === href ? 'page' : undefined);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className={styles.button}
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen((value) => !value)}
      >
        {open ? <CloseIcon className={styles.icon} /> : <MenuIcon className={styles.icon} />}
        <span className="visually-hidden">{open ? 'Close menu' : 'Menu'}</span>
      </button>

      <div
        ref={panelRef}
        id="mobile-menu"
        className={styles.panel}
        data-open={open || undefined}
        hidden={!open}
      >
        <nav aria-label="Main">
          <ul className={styles.list}>
            {items.map((item) => (
              <li key={item.label} className={styles.item}>
                <Link href={item.href} className={styles.link} aria-current={current(item.href)}>
                  {item.label}
                </Link>
                {item.children && (
                  <ul className={styles.sublist}>
                    {/* Skip children that repeat the parent link ("About", "All Cottages"). */}
                    {item.children
                      .filter((child) => child.href !== item.href)
                      .map((child) => (
                        <li key={child.label}>
                          <Link href={child.href} className={styles.sublink} aria-current={current(child.href)}>
                            {child.label}
                          </Link>
                        </li>
                      ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.contact}>
          <Link href={ENQUIRE_HREF} className={styles.enquire}>
            Enquire
          </Link>
          <a href={CONTACT.phoneHref} className={styles.contactLink}>
            <PhoneIcon className={styles.contactIcon} />
            {CONTACT.phoneDisplay}
          </a>
          <a href={CONTACT.emailHref} className={styles.contactLink}>
            <MailIcon className={styles.contactIcon} />
            {CONTACT.email}
          </a>
        </div>
      </div>
    </>
  );
}
