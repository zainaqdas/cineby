import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  allowedDevOrigins: ['3000-cs-246670097857-default.cs-asia-southeast1-fork.cloudshell.dev'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'image.tmdb.org', pathname: '/t/p/**' },
      { protocol: 'https', hostname: 'wsrv.nl', pathname: '/**' },
    ],
  },
};

export default nextConfig;
