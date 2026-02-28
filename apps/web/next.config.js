/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@tidepilot/ui', '@tidepilot/lib', '@tidepilot/db', '@tidepilot/ai'],
  experimental: {
    serverComponentsExternalPackages: ['sharp', 'tesseract.js'],
  },
};

module.exports = nextConfig;
