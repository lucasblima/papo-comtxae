/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    // Se você remover output: 'export', também pode remover esta linha
    // unoptimized: true,
  },
}

module.exports = nextConfig
