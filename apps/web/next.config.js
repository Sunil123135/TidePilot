/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@tidepilot/ui', '@tidepilot/lib', '@tidepilot/db', '@tidepilot/ai'],
};

module.exports = nextConfig;
