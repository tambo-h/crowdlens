import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Set the tracing root to avoid issues with parent lockfiles
  outputFileTracingRoot: path.join(__dirname, "./"),
  // Run ESLint separately via `npm run lint` (avoids deprecated next lint)
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Stub optional peer deps from @standard-community/standard-json
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      effect: false,
      sury: false,
      "@valibot/to-json-schema": false,
    };
    return config;
  },
};

export default nextConfig;
