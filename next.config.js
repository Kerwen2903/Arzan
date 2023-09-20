/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
};

module.exports = {
  images: {
    domains: ['test.arzan.com.tm', '192.168.11.220', '192.168.11.134'],
  },
};
