import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Suppress hydration warnings from Amplify UI
  reactStrictMode: true,
};

export default nextConfig;
