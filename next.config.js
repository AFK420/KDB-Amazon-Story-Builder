/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  outputFileTracingRoot: process.cwd(),
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push({
        "utf-8-validate": "commonjs utf-8-validate",
        bufferutil: "commonjs bufferutil",
      })
    }
    return config
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Disable static optimization for better hydration
  trailingSlash: false,
  // Suppress hydration warnings in development
  reactStrictMode: false,
}

module.exports = nextConfig
