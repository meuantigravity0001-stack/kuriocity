import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'Kurió City Tour — Zeladoria Colaborativa & Conexão Local',
  description:
    'Kurió City Tour — Zeladoria colaborativa e exploração urbana conectada.',
  keywords: ['kurió city tour', 'kurio', 'zeladoria urbana', 'cidadania', 'pix p2p', 'mapa cívico', 'IPTU', 'comércio local'],
  authors: [{ name: 'Kurió City Tour' }],
  openGraph: {
    title: 'Kurió City Tour — Zeladoria Colaborativa & Conexão Local',
    description: 'Kurió City Tour — Zeladoria colaborativa e exploração urbana conectada.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#2563eb',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className={inter.variable} data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  )
}
