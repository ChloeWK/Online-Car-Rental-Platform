/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable strict mode for better development experience
  reactStrictMode: true,
  
  // Configure experimental features
  experimental: {
    // Enable server actions
    serverActions: {}
  },

  // Configure images
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  // Enable proper error checking
  eslint: {
    // Only ignore during builds if you're in production
    ignoreDuringBuilds: process.env.NODE_ENV === 'production',
  },
  
  typescript: {
    // Only ignore during builds if you're in production
    ignoreBuildErrors: process.env.NODE_ENV === 'production',
  },
}

export default nextConfig
