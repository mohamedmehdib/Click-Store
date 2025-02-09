import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['govapelychvgxzjjmdda.supabase.co'], // Add your Supabase URL here
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'govapelychvgxzjjmdda.supabase.co',
        pathname: '/storage/v1/object/public/products/**',
      },
    ],
  },
};

export default nextConfig;
