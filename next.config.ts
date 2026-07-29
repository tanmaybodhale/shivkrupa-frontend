import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  compress: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 3600, // cache optimized images for 1 hour
  },
};

export default nextConfig;
