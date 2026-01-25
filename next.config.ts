import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable future-friendly defaults progressively via explicit config.
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "**",
      },
    ],
  },

  // TypeScript strict error checking enabled
  typescript: {
    ignoreBuildErrors: false,
  },

  productionBrowserSourceMaps: false,
  turbopack: {}, // Silence Turbopack + Webpack config conflict
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  webpack: (config, { dev }) => {
    if (dev) {
      config.devtool = false; // Disable source maps in dev
    }
    return config;
  },
};

  export default nextConfig;
