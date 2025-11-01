// next.config.js
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pwxpxouatzzxvvvszdnx.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'armoto.vtexassets.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn-xiaomi.waugi.com.ar', // 👈 nuevo dominio permitido
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
