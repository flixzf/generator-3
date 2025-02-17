import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: process.env.BUILD_TYPE === 'github' ? 'export' : undefined,
  images: {
    unoptimized: process.env.BUILD_TYPE === 'github' ? true : false,
  },
  basePath: process.env.BUILD_TYPE === 'github' ? '/generator-3' : '',  // 저장소 이름으로 수정
  assetPrefix: process.env.BUILD_TYPE === 'github' ? '/generator-3' : '',  // 이 줄 추가
};

export default nextConfig;
