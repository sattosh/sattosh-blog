/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    PORT: process.env.PORT || 7878,
  },
  output: 'export',
};

module.exports = nextConfig;
