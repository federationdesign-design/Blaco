'use client';

// The consent UI, ported from the LHM repo. Renders two things:
//  1. The first-visit banner (Accept all / Reject all, equal weight, + Manage).
//  2. The preferences panel, reopened any time via the footer "Cookie settings"
//     control (see CookieSettingsLink below).
// Changes from LHM: cookie policy link points to /cookies, the settings link
// uses a CSS Module class instead of an inline style, and the styles are
// mobile first with 44px touch targets.

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCookieConsent } from './CookieConsentProvider';
import type { ConsentCategories } from './consent';
import styles from './CookieBanner.module.css';

export function CookieBanner() {
  const { bannerOpen, settingsOpen, acceptAll, rejectAll, savePreferences, consent, closeSettings } =
    useCookieConsent();

  const [showPrefs, setShowPrefs] = useState(false);

  // Local toggle state for the preferences panel, seeded from current consent.
  const [analytics, setAnalytics] = useState(consent?.analytics ?? false);
  const [marketing, setMarketing] = useState(consent?.marketing ?? false);

  // Keep local toggles in sync when the panel is opened from the footer.
  useEffect(() => {
    if (settingsOpen) {
      setAnalytics(consent?.analytics ?? false);
      setMarketing(consent?.marketing ?? false);
      setShowPrefs(true);
    }
  }, [settingsOpen, consent]);

  const visible = bannerOpen || settingsOpen;
  if (!visible) return null;

  const inPrefsMode = showPrefs || settingsOpen;

  function handleSave() {
    const categories: ConsentCategories = { necessary: true, analytics, marketing };
    savePreferences(categories);
    setShowPrefs(false);
  }

  function handleClose() {
    // Only allow closing the panel when it was opened from the footer
    // (i.e. a choice already exists). The first-visit banner stays until
    // the visitor actively chooses.
    if (settingsOpen) {
      closeSettings();
      setShowPrefs(false);
    }
  }

  return (
    <div className={styles.overlay} role="region" aria-label="Cookie preferences">
      <div className={styles.panel}>
        {settingsOpen && (
          <button type="button" className={styles.close} onClick={handleClose} aria-label="Close cookie settings">
            &times;
          </button>
        )}

        <div className={styles.body}>
          <h2 className={styles.heading}>Cookies on this site</h2>
          <p className={styles.text}>
            We use essential cookies to make the site work. With your permission we also use analytics cookies to
            understand how the site is used so we can improve it. You can accept, reject, or choose for yourself. You
            can change your mind any time from the footer.{' '}
            <Link href="/cookies" className={styles.link}>
              Read our cookie policy
            </Link>
            .
          </p>

          {inPrefsMode && (
            <div className={styles.prefs}>
              <div className={styles.prefRow}>
                <div className={styles.prefInfo}>
                  <span className={styles.prefName}>Essential</span>
                  <span className={styles.prefDesc}>Required for the site to function. Always on.</span>
                </div>
                <span className={styles.alwaysOn}>Always on</span>
              </div>

              <div className={styles.prefRow}>
                <div className={styles.prefInfo}>
                  <span className={styles.prefName} id="cookie-analytics-label">
                    Analytics
                  </span>
                  <span className={styles.prefDesc}>Google Analytics, to measure visits and improve the site.</span>
                </div>
                <label className={styles.switch}>
                  <input
                    type="checkbox"
                    aria-labelledby="cookie-analytics-label"
                    checked={analytics}
                    onChange={(e) => setAnalytics(e.target.checked)}
                  />
                  <span className={styles.slider} />
                </label>
              </div>

              <div className={styles.prefRow}>
                <div className={styles.prefInfo}>
                  <span className={styles.prefName} id="cookie-marketing-label">
                    Marketing
                  </span>
                  <span className={styles.prefDesc}>Ad and social tracking. Currently not used on this site.</span>
                </div>
                <label className={styles.switch}>
                  <input
                    type="checkbox"
                    aria-labelledby="cookie-marketing-label"
                    checked={marketing}
                    onChange={(e) => setMarketing(e.target.checked)}
                  />
                  <span className={styles.slider} />
                </label>
              </div>
            </div>
          )}
        </div>

        <div className={styles.actions}>
          {inPrefsMode ? (
            <button type="button" className={styles.primary} onClick={handleSave}>
              Save preferences
            </button>
          ) : (
            <>
              <button type="button" className={styles.primary} onClick={acceptAll}>
                Accept all
              </button>
              <button type="button" className={styles.secondary} onClick={rejectAll}>
                Reject all
              </button>
            </>
          )}

          {!inPrefsMode && (
            <button type="button" className={styles.manage} onClick={() => setShowPrefs(true)}>
              Manage preferences
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Drop this into the footer wherever you want the "Cookie settings" control.
// It reopens the preferences panel.
export function CookieSettingsLink({ className }: { className?: string }) {
  const { openSettings } = useCookieConsent();
  return (
    <button type="button" onClick={openSettings} className={className ? `${styles.settingsLink} ${className}` : styles.settingsLink}>
      Cookie settings
    </button>
  );
}
