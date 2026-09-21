import type { NextConfig } from 'next';

// All media is served from public/. No remote image hosts are allowed,
// because the old WordPress server is being retired.
const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
  },
};

export default nextConfig;
