'use client';

// Provides consent state to the whole app and controls when the banner shows.
// Wrap the app body in <CookieConsentProvider> in app/layout.tsx.

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  type ConsentCategories,
  type ConsentState,
  readConsent,
  writeConsent,
  clearAnalyticsCookies,
  GRANT_ALL,
  DENY_ALL,
} from './consent';

type ConsentContextValue = {
  consent: ConsentState; // null until the visitor chooses
  bannerOpen: boolean; // first-visit banner
  settingsOpen: boolean; // reopened via footer link
  acceptAll: () => void;
  rejectAll: () => void;
  savePreferences: (categories: ConsentCategories) => void;
  openSettings: () => void;
  closeSettings: () => void;
};

const CookieConsentContext = createContext<ConsentContextValue | null>(null);

export function CookieConsentProvider({ children }: { children: React.ReactNode }) {
  const [consent, setConsent] = useState<ConsentState>(null);
  const [mounted, setMounted] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Read stored consent after mount to avoid a hydration mismatch.
  useEffect(() => {
    setConsent(readConsent());
    setMounted(true);
  }, []);

  const apply = useCallback((categories: ConsentCategories) => {
    writeConsent(categories);
    setConsent(categories);
    if (!categories.analytics) clearAnalyticsCookies();
  }, []);

  const acceptAll = useCallback(() => {
    apply(GRANT_ALL);
    setSettingsOpen(false);
  }, [apply]);

  const rejectAll = useCallback(() => {
    apply(DENY_ALL);
    setSettingsOpen(false);
  }, [apply]);

  const savePreferences = useCallback(
    (categories: ConsentCategories) => {
      apply(categories);
      setSettingsOpen(false);
    },
    [apply]
  );

  const openSettings = useCallback(() => setSettingsOpen(true), []);
  const closeSettings = useCallback(() => setSettingsOpen(false), []);

  // The first-visit banner shows when mounted and no choice has been stored.
  const bannerOpen = mounted && consent === null;

  return (
    <CookieConsentContext.Provider
      value={{
        consent,
        bannerOpen,
        settingsOpen,
        acceptAll,
        rejectAll,
        savePreferences,
        openSettings,
        closeSettings,
      }}
    >
      {children}
    </CookieConsentContext.Provider>
  );
}

export function useCookieConsent(): ConsentContextValue {
  const ctx = useContext(CookieConsentContext);
  if (!ctx) {
    throw new Error('useCookieConsent must be used inside CookieConsentProvider');
  }
  return ctx;
}
