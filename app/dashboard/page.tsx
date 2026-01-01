'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RoleSidebar } from '@/components/RoleSidebar'
import { Footer } from '@/components/Footer'
import {
  Building2,
  BarChart3,
  Package,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Clock,
  MapPin,
  Truck,
  ChefHat,
  CheckCircle2,
  Calendar,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

interface Branch {
  id: string
  slug: string
  name: string
  school: string
  location: string
  manager: string
  kpis: {
    salesTarget: string
    wastePct: string
    hygieneScore: string
  }
}

interface BranchAnalytics {
  branch: string
  revenue: number
  units: number
  orders: number
  percentage: number
}

interface Dispatch {
  id: string
  deliveryDate: string
  branchDispatches: {
    branchSlug: string
    branchName: string
    status: string
    items: any[]
  }[]
}

export default function BranchManagerDashboard() {
  const { user, loading: authLoading, hasBranchAccess } = useAuth({ 
    required: true, 
    allowedRoles: ['admin', 'operations_lead', 'branch_manager'] 
  })
  
  const [branches, setBranches] = useState<Branch[]>([])
  const [branchAnalytics, setBranchAnalytics] = useState<BranchAnalytics[]>([])
  const [dispatches, setDispatches] = useState<Dispatch[]>([])
  const [loading, setLoading] = useState(true)
  const [todayRevenue, setTodayRevenue] = useState(0)
  const [todayOrders, setTodayOrders] = useState(0)
  const [revenueChange, setRevenueChange] = useState(0)

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user])

  const fetchData = async () => {
    try {
      // Fetch all branches
      const branchesRes = await fetch('/api/branches')
      const allBranches: Branch[] = await branchesRes.json()
      
      // Filter to user's assigned branches (or all if admin/operations_lead)
      let userBranches: Branch[]
      if (user?.role === 'admin' || user?.role === 'operations_lead') {
        userBranches = allBranches.filter(b => b.slug !== 'central-kitchen')
      } else {
        userBranches = allBranches.filter(b => 
          user?.branches?.includes(b.slug)
        )
      }
      setBranches(userBranches)

      // Fetch analytics
      const analyticsRes = await fetch('/api/analytics/branches?period=today')
      const analyticsData = await analyticsRes.json()
      
      // Filter analytics to user's branches
      const userAnalytics = (analyticsData.branches || []).filter((a: BranchAnalytics) =>
        userBranches.some(b => b.name === a.branch || b.slug === a.branch.toLowerCase().replace(/\s+/g, '-'))
      )
      setBranchAnalytics(userAnalytics)

      // Calculate totals for user's branches
      const totalRevenue = userAnalytics.reduce((sum: number, a: BranchAnalytics) => sum + a.revenue, 0)
      const totalOrders = userAnalytics.reduce((sum: number, a: BranchAnalytics) => sum + a.orders, 0)
      setTodayRevenue(totalRevenue)
      setTodayOrders(totalOrders)

      // Fetch summary for change percentage
      const summaryRes = await fetch('/api/analytics/summary')
      const summaryData = await summaryRes.json()
      setRevenueChange(summaryData.today?.changes?.revenue || 0)

      // Fetch dispatches
      const dispatchRes = await fetch('/api/dispatch')
      const dispatchData: Dispatch[] = await dispatchRes.json()
      
      // Filter to dispatches containing user's branches
      const userDispatches = dispatchData.filter(d =>
        d.branchDispatches.some(bd =>
          userBranches.some(b => b.slug === bd.branchSlug)
        )
      ).slice(0, 5) // Last 5 dispatches
      setDispatches(userDispatches)

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const getAnalyticsForBranch = (branchName: string) => {
    return branchAnalytics.find(a => 
      a.branch === branchName || 
      a.branch.toLowerCase().replace(/\s+/g, '-') === branchName.toLowerCase().replace(/\s+/g, '-')
    )
  }

  const getDispatchStatusForBranch = (branchSlug: string) => {
    for (const dispatch of dispatches) {
      const bd = dispatch.branchDispatches.find(d => d.branchSlug === branchSlug)
      if (bd && bd.status !== 'completed') {
        return { status: bd.status, date: dispatch.deliveryDate, items: bd.items?.length || 0 }
      }
    }
    return null
  }

  const getHygieneColor = (score: number) => {
    if (score >= 95) return 'text-green-600 bg-green-100'
    if (score >= 92) return 'text-amber-600 bg-amber-100'
    return 'text-red-600 bg-red-100'
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen">
      <RoleSidebar />

      <main className="flex-1 flex flex-col pt-16 md:pt-0">
        <div className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Branch Dashboard</h1>
                <p className="text-sm text-muted-foreground">
                  Welcome back, {user?.firstName}!
                </p>
              </div>
            </div>
          </div>
        {/* Today's Snapshot */}
        <Card className="mb-8 border-l-4 border-l-primary" data-tour-id="today-snapshot">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="h-4 w-4 text-primary" />
              <h2 className="font-semibold">Today&apos;s Snapshot</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-emerald-50 rounded-lg">
                <DollarSign className="h-5 w-5 text-emerald-600 mx-auto mb-1" />
                <p className="text-2xl font-bold text-emerald-700">{formatCurrency(todayRevenue)}</p>
                <p className="text-xs text-emerald-600">Revenue</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <ShoppingCart className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                <p className="text-2xl font-bold text-blue-700">{todayOrders}</p>
                <p className="text-xs text-blue-600">Orders</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Building2 className="h-5 w-5 text-purple-600 mx-auto mb-1" />
                <p className="text-2xl font-bold text-purple-700">{branches.length}</p>
                <p className="text-xs text-purple-600">Your Branches</p>
              </div>
              <div className={`text-center p-4 rounded-lg ${revenueChange >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                {revenueChange >= 0 ? (
                  <TrendingUp className="h-5 w-5 text-green-600 mx-auto mb-1" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-red-600 mx-auto mb-1" />
                )}
                <p className={`text-2xl font-bold ${revenueChange >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                  {revenueChange >= 0 ? '+' : ''}{revenueChange}%
                </p>
                <p className={`text-xs ${revenueChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>vs Yesterday</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Your Branches */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Building2 className="h-4 w-4 text-primary" />
            Your Branches
          </h2>
          
          {branches.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No Branches Assigned</h3>
                <p className="text-muted-foreground">
                  Contact your administrator to get branches assigned to your account.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" data-tour-id="branch-cards">
              {branches.map(branch => {
                const analytics = getAnalyticsForBranch(branch.name)
                const dispatchStatus = getDispatchStatusForBranch(branch.slug)
                const hygieneScore = parseInt(branch.kpis.hygieneScore) || 0
                
                return (
                  <Card key={branch.id} className="hover:shadow-lg transition-all duration-300 group">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-lg">{branch.name}</h3>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {branch.location}
                          </p>
                        </div>
                        <Badge className={`${getHygieneColor(hygieneScore)} border-0`}>
                          {hygieneScore || 'N/A'}
                        </Badge>
                      </div>

                      {/* Analytics */}
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        <div className="bg-muted/50 rounded p-2 text-center">
                          <p className="text-lg font-bold">
                            {analytics ? formatCurrency(analytics.revenue) : 'N/A'}
                          </p>
                          <p className="text-xs text-muted-foreground">Today</p>
                        </div>
                        <div className="bg-muted/50 rounded p-2 text-center">
                          <p className="text-lg font-bold">
                            {analytics?.orders || 0}
                          </p>
                          <p className="text-xs text-muted-foreground">Orders</p>
                        </div>
                      </div>

                      {/* Dispatch Status */}
                      {dispatchStatus && (
                        <div className={`
                          flex items-center gap-2 p-2 rounded text-sm mb-4
                          ${dispatchStatus.status === 'pending' ? 'bg-amber-50 text-amber-700' :
                            dispatchStatus.status === 'dispatched' ? 'bg-blue-50 text-blue-700' :
                            'bg-green-50 text-green-700'}
                        `}>
                          <Truck className="h-4 w-4" />
                          <span>
                            {dispatchStatus.status === 'pending' ? 'Dispatch pending' :
                             dispatchStatus.status === 'dispatched' ? 'Dispatch incoming' :
                             dispatchStatus.status === 'packing' ? 'Being packed' :
                             'Receiving'} ({dispatchStatus.items} items)
                          </span>
                        </div>
                      )}

                      <Link href={`/branch/${branch.slug}`}>
                        <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-white transition-colors">
                          View Details
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mb-8" data-tour-id="quick-actions">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/">
              <Card className="hover:shadow-md transition-all cursor-pointer group h-full">
                <CardContent className="pt-6 text-center">
                  <div className="p-3 rounded-xl bg-blue-100 text-blue-600 w-fit mx-auto mb-3 group-hover:scale-110 transition-transform">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <h3 className="font-medium">All Branches</h3>
                  <p className="text-xs text-muted-foreground mt-1">Browse all locations</p>
                </CardContent>
              </Card>
            </Link>

            {branches[0] && (
              <Link href={`/branch/${branches[0].slug}/recipes`}>
                <Card className="hover:shadow-md transition-all cursor-pointer group h-full">
                  <CardContent className="pt-6 text-center">
                    <div className="p-3 rounded-xl bg-orange-100 text-orange-600 w-fit mx-auto mb-3 group-hover:scale-110 transition-transform">
                      <ChefHat className="h-6 w-6" />
                    </div>
                    <h3 className="font-medium">Recipes</h3>
                    <p className="text-xs text-muted-foreground mt-1">Prep instructions</p>
                  </CardContent>
                </Card>
              </Link>
            )}

            <Card className="opacity-60 h-full">
              <CardContent className="pt-6 text-center">
                <div className="p-3 rounded-xl bg-gray-100 text-gray-400 w-fit mx-auto mb-3">
                  <Package className="h-6 w-6" />
                </div>
                <h3 className="font-medium text-muted-foreground">Weekly Order</h3>
                <Badge variant="secondary" className="text-xs mt-1">Coming Soon</Badge>
              </CardContent>
            </Card>

            <Card className="opacity-60 h-full">
              <CardContent className="pt-6 text-center">
                <div className="p-3 rounded-xl bg-gray-100 text-gray-400 w-fit mx-auto mb-3">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <h3 className="font-medium text-muted-foreground">Sales Report</h3>
                <Badge variant="secondary" className="text-xs mt-1">Coming Soon</Badge>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Dispatches */}
        {dispatches.length > 0 && (
          <Card data-tour-id="recent-dispatches">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Truck className="h-4 w-4 text-primary" />
                Recent Dispatches
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {dispatches.slice(0, 3).map(dispatch => {
                  const relevantBranches = dispatch.branchDispatches.filter(bd =>
                    branches.some(b => b.slug === bd.branchSlug)
                  )
                  
                  return (
                    <div key={dispatch.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium">
                          {new Date(dispatch.deliveryDate).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {relevantBranches.map(bd => bd.branchName).join(', ')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {relevantBranches.map(bd => (
                          <Badge 
                            key={bd.branchSlug}
                            className={`
                              ${bd.status === 'completed' ? 'bg-green-100 text-green-700' :
                                bd.status === 'dispatched' || bd.status === 'receiving' ? 'bg-blue-100 text-blue-700' :
                                'bg-amber-100 text-amber-700'}
                              border-0
                            `}
                          >
                            {bd.status === 'completed' ? <CheckCircle2 className="h-3 w-3 mr-1" /> : null}
                            {bd.status}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}
        </div>
        <Footer />
      </main>
    </div>
  )
}

