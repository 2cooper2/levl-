/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [
      "localhost",
      "127.0.0.1",
      "levl-platform.vercel.app",
      "res.cloudinary.com",
      "images.unsplash.com",
      "tailwindui.com",
      "picsum.photos",
    ],
    unoptimized: process.env.NODE_ENV !== "production",
  },
  experimental: {
    serverActions: true,
  },
  typescript: {
    // During development, type errors won't stop the app from working
    ignoreBuildErrors: process.env.NODE_ENV !== "production",
  },
  eslint: {
    // During development, linting errors won't stop the app from working
    ignoreDuringBuilds: process.env.NODE_ENV !== "production",
  },
  // Add headers for security and CORS
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
        ],
      },
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
          { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" },
        ],
      },
    ];
  },
  // Add rewrites for cleaner URLs
  async rewrites() {
    return [
      {
        source: "/api/health-check",
        destination: "/api/health",
      },
      {
        source: "/stripe-webhooks",
        destination: "/api/stripe-webhook",
      },
    ];
  },
  // Define redirects for common paths
  async redirects() {
    return [
      {
        source: "/dashboard/home",
        destination: "/dashboard",
        permanent: true,
      },
      {
        source: "/login",
        destination: "/auth/login",
        permanent: true,
      },
      {
        source: "/signup",
        destination: "/auth/signup",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
