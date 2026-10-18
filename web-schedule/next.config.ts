import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'pub-r2.bokistore.vn' },
      { protocol: 'https', hostname: '*.r2.dev' },
      { protocol: 'https', hostname: '**.supabase.co' },
    ],
  },
  async redirects() {
    return [
      {
        source: '/lich-phat-hanh/slug/:slug*',
        destination: '/tap-truyen/:slug*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
