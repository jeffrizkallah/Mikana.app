import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Providers } from '@/components/Providers'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#1a1a31' },
  ],
}

export const metadata: Metadata = {
  title: 'Branch Guidebook | Mikana',
  description: 'Comprehensive operational guide for Mikana branch operations',
  keywords: ['branch operations', 'guidebook', 'Mikana', 'operational excellence'],
  icons: {
    icon: '/Add a heading.png',
    shortcut: '/Add a heading.png',
    apple: '/Add a heading.png',
  },
  openGraph: {
    title: 'Branch Guidebook | Mikana',
    description: 'Comprehensive operational guide for Mikana branch operations',
    images: [
      {
        url: '/Add a heading.png',
        width: 1200,
        height: 630,
        alt: 'Mikana Branch Guidebook Logo',
      }
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Branch Guidebook | Mikana',
    description: 'Comprehensive operational guide for Mikana branch operations',
    images: ['/Add a heading.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen antialiased overflow-x-hidden">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}

