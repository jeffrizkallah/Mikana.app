'use client'

import { RoleSidebar } from '@/components/RoleSidebar'
import { Footer } from '@/components/Footer'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      <RoleSidebar />
      <main className="flex-1 flex flex-col pt-16 md:pt-0">
        <div className="flex-1 container mx-auto px-4 py-8">
          {children}
        </div>
        <Footer />
      </main>
    </div>
  )
}

