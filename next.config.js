/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
        pathname: '/**',
      },
    ],
    unoptimized: true,
  },
  env: {
    // URL dell'API locale - per ora usiamo l'API esistente
    API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:3001',
  },
}

module.exports = nextConfig
