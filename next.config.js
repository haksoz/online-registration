/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Generate build ID for cache busting
  generateBuildId: async () => {
    return `build-${Date.now()}`
  },
  // Optimize fonts and emojis
  optimizeFonts: true,
  // Experimental features
  experimental: {
    // Force all API routes to be dynamic by default
    isrMemoryCacheSize: 0,
  },
}

module.exports = nextConfig

