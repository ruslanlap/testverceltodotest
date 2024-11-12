// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ];
  },
  // Ensure API routes are built correctly
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
}

export default nextConfig;