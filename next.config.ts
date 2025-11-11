import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  // Strict mode for React 19
  reactStrictMode: true,

  // Optimize package imports for faster builds
  experimental: {
    optimizePackageImports: ["lucide-react", "clsx"],
  },

  // Configure allowed image domains if needed
  images: {
    remotePatterns: [],
    // Use modern image formats
    formats: ["image/avif", "image/webp"],
  },

  // Security headers
  // async headers() {
  //   return [
  //     {
  //       source: "/:path*",
  //       headers: [
  //         {
  //           key: "X-DNS-Prefetch-Control",
  //           value: "on",
  //         },
  //         {
  //           key: "X-Frame-Options",
  //           value: "SAMEORIGIN",
  //         },
  //         {
  //           key: "X-Content-Type-Options",
  //           value: "nosniff",
  //         },
  //         {
  //           key: "Referrer-Policy",
  //           value: "origin-when-cross-origin",
  //         },
  //       ],
  //     },
  //   ];
  // },
};

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

export default withNextIntl(nextConfig);
