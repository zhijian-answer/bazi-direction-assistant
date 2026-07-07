import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  assetPrefix: process.env.NEXT_PUBLIC_ASSET_PREFIX || undefined,
  allowedDevOrigins: ["127.0.0.1"],
  serverExternalPackages: ["bazi-calculator-by-alvamind"],
  outputFileTracingIncludes: {
    "/api/profiles": ["./node_modules/bazi-calculator-by-alvamind/dist/dates_mapping.json"],
  },
};

export default nextConfig;
