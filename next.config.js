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
    // URL dell'API Vercel - può essere sovrascritto con variabile d'ambiente
    API_BASE_URL: process.env.API_BASE_URL || 'https://recap-show-api.vercel.app',
  },
}

module.exports = nextConfig
