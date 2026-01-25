import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'files.227wiki.eu.org', 
        pathname: '/d/Backup/**',        
      },
      {
        protocol: 'https',
        hostname: 'pbs.twimg.com',       // 推特头像域名
      },
    ],
  },
};

export default nextConfig;
