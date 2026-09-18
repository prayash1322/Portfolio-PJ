import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Strip X-Powered-By response header
  poweredByHeader: false,

  // Enable gzip compression
  compress: true,

  images: {
    // Serve modern formats automatically (browsers that support AVIF/WebP get them)
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
