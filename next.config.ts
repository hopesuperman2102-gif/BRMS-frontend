/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbo: {
      enabled: false, //  force Webpack
    },
  },
};

module.exports = nextConfig;
