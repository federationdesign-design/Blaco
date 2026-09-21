// Consent model + storage helpers for the Blaco Hill Farm Cottages cookie banner (ported from the LHM repo).
//
// The consent record itself is a "strictly necessary" preference, so storing
// it does not require consent. We keep it in localStorage for simplicity since
// all script gating happens client side.

export type ConsentCategories = {
  necessary: true; // always granted, cannot be switched off
  analytics: boolean; // GA4
  marketing: boolean; // Meta Pixel / ad tracking (off until you add one)
};

// null means the visitor has not made a choice yet (show the banner).
export type ConsentState = ConsentCategories | null;

const STORAGE_KEY = 'blaco-cookie-consent';

// Bump this number if your cookie policy materially changes. Everyone will be
// re-prompted because their stored version will no longer match.
const CONSENT_VERSION = 1;

type StoredConsent = {
  version: number;
  categories: ConsentCategories;
  timestamp: string;
};

export function readConsent(): ConsentState {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredConsent;
    if (parsed.version !== CONSENT_VERSION) return null; // policy changed, re-ask
    return parsed.categories;
  } catch {
    return null;
  }
}

export function writeConsent(categories: ConsentCategories): void {
  if (typeof window === 'undefined') return;
  const record: StoredConsent = {
    version: CONSENT_VERSION,
    categories,
    timestamp: new Date().toISOString(),
  };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
  } catch {
    // storage unavailable (private mode quota etc.) - fail silently
  }
}

export const GRANT_ALL: ConsentCategories = {
  necessary: true,
  analytics: true,
  marketing: true,
};

export const DENY_ALL: ConsentCategories = {
  necessary: true,
  analytics: false,
  marketing: false,
};

// When a visitor withdraws analytics consent we proactively clear the GA
// cookies that may already be set, rather than waiting for them to expire.
export function clearAnalyticsCookies(): void {
  if (typeof document === 'undefined') return;
  const host = window.location.hostname;
  // GA cookies are typically _ga, _ga_XXXX, _gid, _gat. Match the family.
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const name = cookie.split('=')[0]?.trim();
    if (!name) continue;
    if (name === '_ga' || name.startsWith('_ga_') || name === '_gid' || name.startsWith('_gat')) {
      // Expire on the current host and on the registrable domain.
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${host}`;
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.${host}`;
    }
  }
}
