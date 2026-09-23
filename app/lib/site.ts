// Site-wide details and menus, taken from the live WordPress header and footer.

export const SITE_NAME = 'Blaco Hill Farm Cottages';

// The live domain. Canonicals, the sitemap, og:url and og:image all use it.
export const SITE_URL = 'https://blacohillcottages.co.uk';

// The brand suffix on every page title. It is deliberately shorter than
// SITE_NAME: Google shows about 60 characters, and the full name spent 27 of
// them, which forced the longer FAQ and testimonial titles to be paraphrased.
// With this the live wording fits (agent/SEO.md).
export const TITLE_SUFFIX = 'Blaco Hill';

export const CONTACT = {
  phoneDisplay: '07718 762 845',
  phoneHref: 'tel:+447718762845',
  email: 'victoria@blacohillcottages.co.uk',
  emailHref: 'mailto:victoria@blacohillcottages.co.uk',
} as const;

// Always-visible mobile action. Points at the live booking request form.
export const ENQUIRE_HREF = '/booking-request-form';

export type NavItem = {
  label: string;
  href: string;
  children?: NavItem[];
};

// Primary menu, in live order.
export const PRIMARY_NAV: NavItem[] = [
  { label: 'Home', href: '/' },
  {
    label: 'About',
    href: '/about',
    children: [
      { label: 'About', href: '/about' },
      { label: 'Games Room', href: '/about/games-room' },
      { label: 'Local Interests', href: '/about/local-interests' },
      { label: 'Checking in', href: '/checking-in-checkout-process' },
      { label: 'FAQ', href: '/about/faq' },
      { label: 'Testimonials', href: '/about/testimonials' },
      { label: 'Accessibility Statement', href: '/accessibility-statement' },
    ],
  },
  {
    label: 'Our Cottages',
    href: '/our-cottages',
    children: [
      { label: 'For five or six people', href: '/for-six-people' },
      { label: 'For four people', href: '/for-four-people' },
      { label: 'For two people', href: '/for-two-people' },
      { label: 'All Cottages', href: '/our-cottages' },
    ],
  },
  { label: 'Contact', href: '/contact-us' },
];

// Footer: second menu.
export const FOOTER_INFO_NAV: NavItem[] = [
  { label: 'Frequently Asked Questions', href: '/about/faq' },
  { label: 'Checking in & Checkout', href: '/checking-in-checkout-process' },
  { label: 'Testimonials', href: '/about/testimonials' },
];

// Footer: legal menu, plus the modern slavery statement (brief 6).
export const FOOTER_LEGAL_NAV: NavItem[] = [
  { label: 'Cookies', href: '/cookies' },
  { label: 'Disclaimer', href: '/disclaimer' },
  { label: 'Privacy', href: '/privacy-policy-2' },
  { label: 'Accessibility Statement', href: '/accessibility-statement' },
  { label: 'Modern Slavery Statement', href: '/modern-slavery' },
];

export const FOOTER_STRAPLINE =
  'We welcome all people - families, friends, large groups exclusively, business users, moving house/ longer term lets.';

// Checkpoint 2 decision 7: the year updates automatically (set at build time).
export const copyright = () => `Copyright © ${new Date().getFullYear()} - ${SITE_NAME}`;

export const LOGO = {
  src: '/media/2020/08/BHF-logoicon.svg',
  width: 453,
  height: 76,
  alt: 'Blaco Hill Farm Cottages',
};

export const LOGO_WHITE = {
  src: '/media/2020/09/WhiteRGB.svg',
  width: 816,
  height: 492,
  alt: 'Blaco Hill Farm Cottages',
};
