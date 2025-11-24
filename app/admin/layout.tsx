import { Sidebar } from '@/components/Sidebar'
import { Footer } from '@/components/Footer'
import { AdminProtection } from '@/components/AdminProtection'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AdminProtection>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 flex flex-col pt-16 md:pt-0">
          <div className="flex-1 container mx-auto px-4 py-8">
            {children}
          </div>
          <Footer />
        </main>
      </div>
    </AdminProtection>
  )
}

