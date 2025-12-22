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
  // Opt-in place for future instrumentation (OpenTelemetry, logging).
  // instrumentationHook: true, // Uncomment when adding instrumentation.ts
};

export default nextConfig;
