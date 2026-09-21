'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useId, useRef, useState } from 'react';
import styles from './PrimaryNav.module.css';
import { ChevronIcon } from './Icons';
import type { NavItem } from '../lib/site';

// Desktop navigation, shown from 1024px. Submenus open by tap or click on the
// chevron button; hover is only an enhancement for mouse users.
export function PrimaryNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const baseId = useId();

  useEffect(() => setOpen(null), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!navRef.current?.contains(event.target as Node)) setOpen(null);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(null);
    };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const isCurrent = (href: string) => pathname === href;
  const inSection = (item: NavItem) =>
    isCurrent(item.href) || Boolean(item.children?.some((child) => isCurrent(child.href)));

  return (
    <nav ref={navRef} className={styles.nav} aria-label="Main">
      <ul className={styles.list}>
        {items.map((item) => {
          const submenuId = `${baseId}-${item.label}`;
          const expanded = open === item.label;
          return (
            <li key={item.label} className={styles.item} data-open={expanded || undefined}>
              <Link
                href={item.href}
                className={styles.link}
                aria-current={isCurrent(item.href) ? 'page' : undefined}
                data-section={inSection(item) || undefined}
              >
                {item.label}
              </Link>
              {item.children && (
                <>
                  <button
                    type="button"
                    className={styles.toggle}
                    aria-expanded={expanded}
                    aria-controls={submenuId}
                    onClick={() => setOpen(expanded ? null : item.label)}
                  >
                    <ChevronIcon className={styles.chevron} />
                    <span className="visually-hidden">{item.label} submenu</span>
                  </button>
                  <ul id={submenuId} className={styles.submenu}>
                    {item.children.map((child) => (
                      <li key={child.label}>
                        <Link
                          href={child.href}
                          className={styles.sublink}
                          aria-current={isCurrent(child.href) ? 'page' : undefined}
                        >
                          {child.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
