import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: '/generator-3',
  assetPrefix: '/generator-3/',
};

export default nextConfig;
