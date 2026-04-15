/** @type {import('next').NextConfig} */

const securityHeaders = [
  // Force HTTPS for 2 years
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  // Prevent clickjacking
  { key: "X-Frame-Options", value: "DENY" },
  // Prevent MIME sniffing
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Control referrer info
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Disable unused browser features
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(self)" },
  // Enable XSS filter in older browsers
  { key: "X-XSS-Protection", value: "1; mode=block" },
  // Content Security Policy
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // Next.js requires unsafe-inline; Three.js/WebGL requires unsafe-eval for shader compilation
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com",
      // Framer-motion and Tailwind use inline styles
      "style-src 'self' 'unsafe-inline'",
      // Allow images from self, blob, data URIs, and any https source (user images/avatars)
      "img-src 'self' blob: data: https:",
      // Fonts
      "font-src 'self'",
      // API connections: Supabase (https + wss), Stripe, Resend
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com https://api.resend.com",
      // Stripe payment iframe
      "frame-src https://js.stripe.com https://hooks.stripe.com",
      // Workers (Three.js / WebGL)
      "worker-src 'self' blob:",
    ].join("; "),
  },
]

const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: "/(.*)",
        headers: securityHeaders,
      },
    ]
  },
}

export default nextConfig
