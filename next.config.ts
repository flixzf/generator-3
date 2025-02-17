import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: process.env.BUILD_TYPE === 'github' ? 'export' : undefined,
  images: {
    unoptimized: process.env.BUILD_TYPE === 'github' ? true : false,
  },
  basePath: process.env.BUILD_TYPE === 'github' ? '/generator-main-next-2' : '',  // 레포지토리 이름으로 수정
};

export default nextConfig;
