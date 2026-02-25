import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Experimental server actions are stable in Next.js 16
  // Enable logging for debugging in production
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

export default nextConfig;
