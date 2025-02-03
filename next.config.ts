import type { NextConfig } from "next";
import withPlaiceholder from "@plaiceholder/next";
import { env } from "./src/env";
import nextBundleAnalyzer from "@next/bundle-analyzer";

const nextConfig: NextConfig = {
  images: {
    minimumCacheTTL: 604800,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "utfs.io",
        pathname: `/a/${env.UPLOADTHING_APP_ID}/*`,
      },
    ],
  },
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
};

const withBundleAnalyzer = nextBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

export default withBundleAnalyzer(withPlaiceholder(nextConfig));
