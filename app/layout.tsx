import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'Kuriocity — Zeladoria Colaborativa & Conexão Local',
  description:
    'Plataforma cívica P2P onde pedestres, comerciantes e prestadores de serviço se unem para resolver microproblemas urbanos com Pix direto, Google Drive e Dossiê de IPTU.',
  keywords: ['zeladoria urbana', 'cidadania', 'pix p2p', 'kuriocity', 'mapa cívico', 'IPTU', 'comércio local'],
  authors: [{ name: 'Kuriocity' }],
  openGraph: {
    title: 'Kuriocity — Zeladoria Colaborativa & Conexão Local',
    description: 'Melhore o seu bairro, fortaleça o comércio local e receba incentivos fiscais.',
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
