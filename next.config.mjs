/** @type {import('next').NextConfig} */
const nextConfig = {
  // Plain static files, so the game can be hosted on any web server (e.g. a NAS)
  output: 'export',
  assetPrefix: '.',
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
