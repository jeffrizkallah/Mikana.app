import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Branch Guidebook | Mikana',
  description: 'Comprehensive operational guide for Mikana branch operations',
  keywords: ['branch operations', 'guidebook', 'Mikana', 'operational excellence'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        {children}
      </body>
    </html>
  )
}

