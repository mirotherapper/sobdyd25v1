/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: [
          '**/node_modules/**',
          '**/.next/**',
          '**/.git/**',
          '**/out/**',
          '**/dist/**',
          '**/build/**',
          '**/coverage/**',
          '**/.vscode/**',
          '**/.idea/**',
        ],
      };
    }
    return config;
  },
  /* config options here */
};

module.exports = nextConfig;
