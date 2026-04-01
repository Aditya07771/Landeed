const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.externals.push('pino-pretty', 'lokijs', 'encoding')
    config.resolve.alias = {
      ...config.resolve.alias,
      '@react-native-async-storage/async-storage': path.join(
        __dirname,
        'lib/stubs/async-storage.js'
      ),
    }
    return config
  },
  images: {
    domains: ['gateway.pinata.cloud', 'images.unsplash.com'],
  },
}
module.exports = nextConfig
