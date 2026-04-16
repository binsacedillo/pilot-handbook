import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
});

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.254.102", "192.168.254.102:3000", "localhost:3000"],
  // Enable future-friendly defaults progressively via explicit config.
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "img.clerk.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "*.gstatic.com",
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

export default withPWA(nextConfig);
