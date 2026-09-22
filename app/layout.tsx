import type { Metadata, Viewport } from 'next';
import { Baskervville, Raleway } from 'next/font/google';
import './globals.css';
import { SiteHeader } from './components/SiteHeader';
import { SiteFooter } from './components/SiteFooter';
import { SITE_NAME, TITLE_SUFFIX } from './lib/site';
import { CookieConsentProvider } from './components/cookies/CookieConsentProvider';
import { CookieBanner } from './components/cookies/CookieBanner';
import { Analytics } from './components/cookies/Analytics';
import { LodgingBusinessSchema } from './components/StructuredData';

const baskervville = Baskervville({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-baskervville',
});

const raleway = Raleway({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '600', '700'],
  display: 'swap',
  variable: '--font-raleway',
});

// Live site has no meta descriptions, so none are set here.
export const metadata: Metadata = {
  metadataBase: new URL('https://blacohillcottages.co.uk'),
  title: {
    default: `${SITE_NAME} | Holiday Rentals`,
    template: `%s | ${TITLE_SUFFIX}`,
  },
  icons: {
    icon: [{ url: '/media/2020/11/cropped-bird.png', type: 'image/png' }],
    apple: [{ url: '/media/2020/11/cropped-bird.png' }],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#00a86b',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" className={`${baskervville.variable} ${raleway.variable}`}>
      <body>
        <LodgingBusinessSchema />
        <CookieConsentProvider>
          <SiteHeader />
          <main id="main">{children}</main>
          <SiteFooter />
          <Analytics />
          <CookieBanner />
        </CookieConsentProvider>
      </body>
    </html>
  );
}
