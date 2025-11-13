/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Generate build ID for cache busting
  generateBuildId: async () => {
    return `build-${Date.now()}`
  },
  // Optimize fonts and emojis
  optimizeFonts: true,
}

module.exports = nextConfig

