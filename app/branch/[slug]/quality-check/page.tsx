'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { RoleSidebar } from '@/components/RoleSidebar'
import { Footer } from '@/components/Footer'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { QualityCheckFormQuick } from '@/components/QualityCheckFormQuick'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/useAuth'
import { 
  ClipboardCheck, 
  History, 
  CheckCircle2, 
  XCircle,
  Clock,
  ArrowLeft,
  Coffee,
  Sun
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Branch {
  id: string
  slug: string
  name: string
}

interface QualityCheck {
  id: number
  submissionDate: string
  mealService: string
  productName: string
  section: string
  tasteScore: number
  appearanceScore: number
}

export default function QualityCheckPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  
  const { user, loading: authLoading } = useAuth({ 
    required: true, 
    allowedRoles: ['admin', 'operations_lead', 'branch_manager'] 
  })
  
  const [branch, setBranch] = useState<Branch | null>(null)
  const [todayChecks, setTodayChecks] = useState<QualityCheck[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user, slug, showForm])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch branch info
      const branchRes = await fetch(`/api/branches/${slug}`, {
        cache: 'no-store'
      })
      if (branchRes.ok) {
        const branchData = await branchRes.json()
        setBranch(branchData)
      }

      // Fetch today's quality checks for this branch
      const today = new Date().toISOString().split('T')[0]
      const apiUrl = `/api/quality-checks?branch=${slug}&startDate=${today}&endDate=${today}`
      console.log('Fetching quality checks from:', apiUrl)
      console.log('Today date:', today)
      
      const checksRes = await fetch(apiUrl, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      })
      console.log('Response status:', checksRes.status)
      
      if (checksRes.ok) {
        const checksData = await checksRes.json()
        console.log('Fetched quality checks:', checksData)
        console.log('Number of checks:', checksData.length)
        setTodayChecks(checksData)
      } else {
        const errorData = await checksRes.json()
        console.error('Error fetching quality checks:', errorData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFormSuccess = () => {
    console.log('🔄 Form submitted successfully, refreshing data...')
    setShowForm(false)
    // Force immediate refresh
    setTimeout(() => {
      console.log('🔄 Triggering fetchData...')
      fetchData()
    }, 100)
  }

  const breakfastChecks = todayChecks.filter(c => c.mealService === 'breakfast')
  const lunchChecks = todayChecks.filter(c => c.mealService === 'lunch')
  const hasBreakfastCheck = breakfastChecks.length > 0
  const hasLunchCheck = lunchChecks.length > 0

  console.log('Today checks:', todayChecks)
  console.log('Breakfast checks:', breakfastChecks.length, 'Lunch checks:', lunchChecks.length)

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen">
      <RoleSidebar />

      <main className="flex-1 flex flex-col pt-16 md:pt-0">
        <div className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
          <Breadcrumbs
            items={[
              { label: 'Dashboard', href: '/dashboard' },
              { label: branch?.name || 'Branch', href: `/branch/${slug}` },
              { label: 'Quality Check' },
            ]}
          />

          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-green-100">
                  <ClipboardCheck className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Quality Check</h1>
                  <p className="text-sm text-muted-foreground">{branch?.name}</p>
                </div>
              </div>
              {!showForm && (
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => fetchData()}
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary"></div>
                    ) : (
                      'Refresh'
                    )}
                  </Button>
                  <Button onClick={() => router.push('/dashboard')}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                </div>
              )}
            </div>
          </div>

          {showForm ? (
            <div>
              <Button 
                variant="ghost" 
                onClick={() => setShowForm(false)}
                className="mb-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>

              <QualityCheckFormQuick 
                branchSlug={slug}
                branchName={branch?.name || slug}
                onSuccess={handleFormSuccess}
              />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Summary Stats */}
              <Card className="border-l-4 border-l-blue-500">
                <CardContent className="py-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Total Submissions Today</p>
                      <p className="text-4xl font-bold text-blue-600">{todayChecks.length}</p>
                    </div>
                    <div className="flex gap-6">
                      <div className="text-center">
                        <div className={cn(
                          "w-16 h-16 rounded-full flex items-center justify-center mb-2",
                          hasBreakfastCheck ? "bg-green-100" : "bg-gray-100"
                        )}>
                          <Coffee className={cn(
                            "h-7 w-7",
                            hasBreakfastCheck ? "text-green-600" : "text-gray-400"
                          )} />
                        </div>
                        <p className="text-xs font-medium text-muted-foreground">Breakfast</p>
                        <p className="text-lg font-bold">{breakfastChecks.length}</p>
                      </div>
                      <div className="text-center">
                        <div className={cn(
                          "w-16 h-16 rounded-full flex items-center justify-center mb-2",
                          hasLunchCheck ? "bg-green-100" : "bg-gray-100"
                        )}>
                          <Sun className={cn(
                            "h-7 w-7",
                            hasLunchCheck ? "text-green-600" : "text-gray-400"
                          )} />
                        </div>
                        <p className="text-xs font-medium text-muted-foreground">Lunch</p>
                        <p className="text-lg font-bold">{lunchChecks.length}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Today's Submissions */}
              {todayChecks.length > 0 ? (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <History className="h-5 w-5" />
                      Today&apos;s Submissions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 mb-4">
                      {todayChecks.map((check) => (
                        <div 
                          key={check.id}
                          className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            {check.mealService === 'breakfast' ? (
                              <Coffee className="h-5 w-5 text-amber-600" />
                            ) : (
                              <Sun className="h-5 w-5 text-orange-500" />
                            )}
                            <div>
                              <p className="font-medium">{check.productName}</p>
                              <p className="text-sm text-muted-foreground">
                                {check.section} • {new Date(check.submissionDate).toLocaleTimeString('en-US', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-yellow-600 border-yellow-200 bg-yellow-50">
                              Taste: {check.tasteScore}/5
                            </Badge>
                            <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">
                              Look: {check.appearanceScore}/5
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-dashed">
                  <CardContent className="py-12 text-center">
                    <ClipboardCheck className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                    <p className="text-muted-foreground">No quality checks submitted yet today</p>
                    <p className="text-sm text-muted-foreground mt-1">Click below to start your first check</p>
                  </CardContent>
                </Card>
              )}

              {/* Start Quality Check Button */}
              <Button 
                onClick={() => setShowForm(true)}
                className="w-full bg-green-600 hover:bg-green-700 h-14"
                size="lg"
              >
                <ClipboardCheck className="h-5 w-5 mr-2" />
                Start Quality Check
              </Button>
            </div>
          )}
        </div>
        <Footer />
      </main>
    </div>
  )
}

