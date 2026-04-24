/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Allow local /public images — add external domains here if needed
    remotePatterns: [],
  },
  // Security headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options",        value: "DENY" },
          { key: "X-XSS-Protection",       value: "1; mode=block" },
          { key: "Referrer-Policy",        value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
