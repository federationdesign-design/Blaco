import type { NextConfig } from 'next';

// All media is served from public/. No remote image hosts are allowed,
// because the old WordPress server is being retired.
const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    // Liquid layout: widths up to 2800px screens (and 3840 for high density).
    deviceSizes: [640, 750, 828, 1080, 1200, 1440, 1920, 2048, 2560, 2800, 3840],
  },
  async redirects() {
    return [
      // Checkpoint 1 decision 2: category archives.
      { source: '/category/faq', destination: '/about/faq', permanent: true },
      { source: '/category/faq/page/:page', destination: '/about/faq', permanent: true },
      { source: '/category/testimonial', destination: '/about/testimonials', permanent: true },
      { source: '/category/uncategorized', destination: '/about/faq', permanent: true },
      // Checkpoint 1 decision 3: leftover pages.
      { source: '/sample-page', destination: '/', permanent: true },
      { source: '/booking-test', destination: '/', permanent: true },
      // Live cards link here, but the page's slug is chaffinch-2.
      { source: '/our-cottages/chaffinch', destination: '/our-cottages/chaffinch-2', permanent: true },
    ];
  },
};

export default nextConfig;
