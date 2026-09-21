'use client';

// Ported from the LHM repo. Loads GA4 only after the visitor has granted
// analytics consent. Because the script is not rendered at all until consent
// is true, no GA cookies are set before the visitor opts in. When consent is
// withdrawn the provider clears existing GA cookies (see clearAnalyticsCookies).

import Script from 'next/script';
import { useCookieConsent } from './CookieConsentProvider';

// Brief 6: the site's GA4 measurement ID.
const GA_ID = 'G-TN54HGV0ME';

export function Analytics() {
  const { consent } = useCookieConsent();

  if (!consent?.analytics) return null; // not consented (or not chosen yet)

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}', { anonymize_ip: true });
        `}
      </Script>
    </>
  );
}

// Marketing slot, kept from LHM. Empty: the site runs no ad or social
// tracking. Anything added here is gated on marketing consent the same way GA
// is gated on analytics consent.
export function MarketingScripts() {
  const { consent } = useCookieConsent();
  if (!consent?.marketing) return null;
  return null;
}
