/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'bcryptjs'],
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/landing-ar.html',
        permanent: false,
      },
      {
        source: '/ar',
        destination: '/landing-ar.html',
        permanent: false,
      },
      {
        source: '/en',
        destination: '/landing-en.html',
        permanent: false,
      },
    ]
  },
}

module.exports = nextConfig
