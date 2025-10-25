import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ['@react-google-maps/api'], // 필요 시 추가
  },
};

export default nextConfig;
