import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["bazi-calculator-by-alvamind"],
  outputFileTracingIncludes: {
    "/api/profiles": ["./node_modules/bazi-calculator-by-alvamind/dist/dates_mapping.json"],
  },
};

export default nextConfig;
