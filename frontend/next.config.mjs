const basePath = (process.env.NEXT_PUBLIC_BASE_PATH || '').replace(/\/$/, '')

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  basePath,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
    NEXT_PUBLIC_DEMO_MODE: process.env.NEXT_PUBLIC_DEMO_MODE || 'static',
  },
}
export default nextConfig
