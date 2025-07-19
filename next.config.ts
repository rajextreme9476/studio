import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export', // 🔥 REQUIRED for static export
  trailingSlash: true, // 👈 Needed for GitHub Pages
  basePath: '/studio', // 👈 This must match your repo name on GitHub

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
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
