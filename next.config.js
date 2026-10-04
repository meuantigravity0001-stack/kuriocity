/** @type {import('next').NextConfig} */
const nextConfig = {
  // Turbopack (padrão no Next.js 16+)
  turbopack: {},

  // Permitir imagens do Supabase e OSM
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: '*.supabase.in' },
      { protocol: 'https', hostname: 'tile.openstreetmap.org' },
    ],
  },

  // Headers de segurança
  async headers() {
    return [
      {
        source: '/api/tracking',
        headers: [
          { key: 'Cache-Control', value: 'no-store, no-cache' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
        ],
      },
    ]
  },
}

module.exports = nextConfig
