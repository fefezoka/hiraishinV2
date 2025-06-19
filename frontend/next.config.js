/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['opgg-static.akamaized.net', 'ddragon.leagueoflegends.com'],
    unoptimized: true,
  },
  output: 'standalone',
};

module.exports = nextConfig;
