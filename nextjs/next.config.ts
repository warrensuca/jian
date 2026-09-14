import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/auth/:path*",
        destination: "/api/index.py",
      },
      {
        source: "/favorited_recipes/:path*",
        destination: "/api/index.py",
      },
      {
        source: "/recipe_interactions/:path*",
        destination: "/api/index.py",
      },
      {
        source: "/recipe_ratings/:path*",
        destination: "/api/index.py",
      },
    ];
  },
};

export default nextConfig;
