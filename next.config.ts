import type { NextConfig } from "next";
import { execSync } from 'child_process';

let commitHash = 'dev';
try {
  commitHash = execSync('git rev-parse --short HEAD').toString().trim();
} catch {
  console.warn('Could not get git commit hash, falling back to "dev"');
}


const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_COMMIT_SHA: commitHash,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.227wiki.eu.org',
        pathname: '/archive/**',
      },
      {
        protocol: 'https',
        hostname: 'pbs.twimg.com',      
      },
    ],
  },
};

export default nextConfig;
