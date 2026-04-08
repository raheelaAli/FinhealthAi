/** @type {import('next').NextConfig} */
const nextConfig = {
  // Server Actions are stable in Next.js 15 — no experimental flag needed
  // This tells Next.js to not bundle these packages on the server side
  serverExternalPackages: ["@prisma/client", "bcryptjs"],
};

module.exports = nextConfig;
