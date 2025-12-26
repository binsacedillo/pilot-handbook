import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable future-friendly defaults progressively via explicit config.
  images: {
    // Add remote patterns when rendering external images (e.g., avatars).
    // Example:
    // remotePatterns: [
    //   { protocol: "https", hostname: "images.example.com" },
    // ],
  },

  productionBrowserSourceMaps: false,
  turbopack: {}, // Silence Turbopack + Webpack config conflict
  webpack: (config, { dev }) => {
    if (dev) {
      config.devtool = false; // Disable source maps in dev
    }
    return config;
  },
};

  export default nextConfig;
