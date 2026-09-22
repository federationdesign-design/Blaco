'use client';

// Ported from the LHM repo. Loads GA4 only after the visitor has granted
// analytics consent. Because the script is not rendered at all until consent
// is true, no GA cookies are set before the visitor opts in. When consent is
// withdrawn the provider clears existing GA cookies (see clearAnalyticsCookies).

import Script from 'next/script';
import { useCookieConsent } from './CookieConsentProvider';

// Brief 6: the site's GA4 measurement ID, set per environment so preview and
// local builds do not report into the live property. It is NEXT_PUBLIC_ because
// this is a client component, which means it is inlined at build time: changing
// it in Vercel needs a redeploy, not just a restart. Unset means no analytics.
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export function Analytics() {
  const { consent } = useCookieConsent();

  if (!consent?.analytics) return null; // not consented (or not chosen yet)
  if (!GA_ID) return null; // no measurement ID configured for this environment

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
