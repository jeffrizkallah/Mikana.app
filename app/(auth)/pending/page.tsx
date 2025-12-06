'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Clock, LogOut, RefreshCw } from 'lucide-react'

export default function PendingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    // If user is active, redirect to their dashboard
    if (status === 'authenticated' && session?.user?.status === 'active') {
      router.push('/')
    }
    // If not authenticated, redirect to login
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [session, status, router])

  const handleRefresh = () => {
    router.refresh()
    window.location.reload()
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: '/login' })
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <Image 
              src="/Add a heading.png" 
              alt="Mikana Logo" 
              width={80} 
              height={80}
              className="rounded-xl shadow-lg"
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Branch Guidebook</h1>
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="pt-8 pb-8">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100">
                <Clock className="h-8 w-8 text-amber-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Account Pending</h2>
              
              {session?.user && (
                <p className="text-muted-foreground">
                  Hi <span className="font-medium">{session.user.firstName}</span>,
                </p>
              )}
              
              <p className="text-muted-foreground">
                Your account is currently pending approval. An administrator will review your request and assign you the appropriate access level.
              </p>

              {session?.user?.status === 'rejected' && (
                <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
                  Your account request was not approved. Please contact an administrator for more information.
                </div>
              )}

              <div className="pt-4 space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleRefresh}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Check Status
                </Button>
                
                <Button 
                  variant="ghost" 
                  className="w-full text-muted-foreground"
                  onClick={handleSignOut}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          If you&apos;ve been waiting a while, please contact your administrator.
        </p>
      </div>
    </div>
  )
}

