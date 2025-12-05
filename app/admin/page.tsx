'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ChefHat, 
  Building2, 
  Truck, 
  ArrowRight,
  Bell,
  Flame,
  Factory,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  MapPin,
  Clock,
  Package,
  FileText,
  Activity,
  Sparkles,
  BarChart3,
  DollarSign,
  ShoppingCart,
} from 'lucide-react'

interface Branch {
  id: string
  slug: string
  name: string
  location: string
  manager: string
  kpis: {
    hygieneScore: string
    wastePct: string
    salesTarget: string
  }
  branchType?: string
}

interface Recipe {
  recipeId: string
  name: string
  category: string
}

interface RecipeInstruction {
  instructionId: string
  dishName: string
  category: string
}

interface Dispatch {
  id: string
  deliveryDate: string
  branchDispatches: {
    branchSlug: string
    branchName: string
    status: string
  }[]
}

interface Notification {
  id: string
  title: string
  type: string
  is_active: boolean
  expires_at: string
}

interface DashboardStats {
  branches: {
    total: number
    byLocation: Record<string, number>
    avgHygiene: number
    lowHygieneCount: number
    highWasteCount: number
  }
  recipes: {
    total: number
    byCategory: Record<string, number>
  }
  instructions: {
    total: number
  }
  dispatches: {
    total: number
    pending: number
    inProgress: number
    completed: number
  }
  notifications: {
    active: number
    expiringSoon: number
  }
  alerts: Alert[]
}

interface Alert {
  id: string
  type: 'warning' | 'info' | 'success'
  title: string
  description: string
  link?: string
}

interface SalesData {
  today: {
    revenue: number
    units: number
    orders: number
    changes: {
      revenue: number
      units: number
      orders: number
    }
  }
  thisMonth: {
    revenue: number
    units: number
    orders: number
    changes: {
      revenue: number
    }
  }
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [branches, setBranches] = useState<Branch[]>([])
  const [salesData, setSalesData] = useState<SalesData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
    fetchSalesData()
  }, [])

  const fetchSalesData = async () => {
    try {
      const response = await fetch('/api/analytics/summary')
      if (response.ok) {
        const data = await response.json()
        setSalesData(data)
      }
    } catch (error) {
      console.error('Failed to fetch sales data:', error)
    }
  }

  const fetchDashboardData = async () => {
    try {
      const [branchesRes, recipesRes, instructionsRes, dispatchesRes, notificationsRes] = await Promise.all([
        fetch('/api/branches'),
        fetch('/api/recipes'),
        fetch('/api/recipe-instructions'),
        fetch('/api/dispatch'),
        fetch('/api/notifications/admin').catch(() => ({ ok: false, json: () => Promise.resolve({ notifications: [] }) }))
      ])

      const branchesData: Branch[] = await branchesRes.json()
      const recipesData: Recipe[] = await recipesRes.json()
      const instructionsData: RecipeInstruction[] = await instructionsRes.json()
      const dispatchesData: Dispatch[] = dispatchesRes.ok ? await dispatchesRes.json() : []
      const notificationsData = notificationsRes.ok ? await (notificationsRes as Response).json() : { notifications: [] }

      setBranches(branchesData)

      // Calculate stats
      const serviceBranches = branchesData.filter(b => b.branchType !== 'production')
      const hygieneScores = serviceBranches
        .map(b => parseInt(b.kpis.hygieneScore))
        .filter(score => !isNaN(score))
      
      const avgHygiene = hygieneScores.length > 0 
        ? Math.round(hygieneScores.reduce((a, b) => a + b, 0) / hygieneScores.length * 10) / 10
        : 0

      const lowHygieneCount = serviceBranches.filter(b => {
        const score = parseInt(b.kpis.hygieneScore)
        return !isNaN(score) && score < 92
      }).length

      const highWasteCount = serviceBranches.filter(b => {
        const waste = parseFloat(b.kpis.wastePct?.replace('%', ''))
        return !isNaN(waste) && waste > 3
      }).length

      // Location breakdown
      const byLocation: Record<string, number> = {}
      serviceBranches.forEach(b => {
        byLocation[b.location] = (byLocation[b.location] || 0) + 1
      })

      // Recipe categories
      const byCategory: Record<string, number> = {}
      recipesData.forEach(r => {
        byCategory[r.category] = (byCategory[r.category] || 0) + 1
      })

      // Dispatch stats
      const allBranchDispatches = dispatchesData.flatMap(d => d.branchDispatches)
      const dispatchStats = {
        total: allBranchDispatches.length,
        pending: allBranchDispatches.filter(bd => bd.status === 'pending').length,
        inProgress: allBranchDispatches.filter(bd => ['packing', 'dispatched', 'receiving'].includes(bd.status)).length,
        completed: allBranchDispatches.filter(bd => bd.status === 'completed').length,
      }

      // Notifications
      const notifications: Notification[] = notificationsData.notifications || []
      const activeNotifications = notifications.filter(n => n.is_active)
      const now = new Date()
      const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)
      const expiringSoon = activeNotifications.filter(n => {
        const expiresAt = new Date(n.expires_at)
        return expiresAt <= threeDaysFromNow && expiresAt > now
      }).length

      // Build alerts
      const alerts: Alert[] = []
      
      // Low hygiene alerts
      serviceBranches.forEach(b => {
        const score = parseInt(b.kpis.hygieneScore)
        if (!isNaN(score) && score < 92) {
          alerts.push({
            id: `hygiene-${b.slug}`,
            type: 'warning',
            title: `${b.name} - Low Hygiene Score`,
            description: `Hygiene score is ${score}, below the 92 threshold`,
            link: `/admin/branches/${b.slug}`
          })
        }
      })

      // High waste alerts
      serviceBranches.forEach(b => {
        const waste = parseFloat(b.kpis.wastePct?.replace('%', ''))
        if (!isNaN(waste) && waste > 3.5) {
          alerts.push({
            id: `waste-${b.slug}`,
            type: 'warning',
            title: `${b.name} - High Waste`,
            description: `Waste at ${b.kpis.wastePct}, above target threshold`,
            link: `/admin/branches/${b.slug}`
          })
        }
      })

      // Pending dispatches
      if (dispatchStats.pending > 0) {
        alerts.push({
          id: 'pending-dispatch',
          type: 'info',
          title: `${dispatchStats.pending} Pending Dispatches`,
          description: 'Dispatches waiting to be packed',
          link: '/dispatch'
        })
      }

      setStats({
        branches: {
          total: serviceBranches.length,
          byLocation,
          avgHygiene,
          lowHygieneCount,
          highWasteCount
        },
        recipes: {
          total: recipesData.length,
          byCategory
        },
        instructions: {
          total: instructionsData.length
        },
        dispatches: dispatchStats,
        notifications: {
          active: activeNotifications.length,
          expiringSoon
        },
        alerts
      })
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Get branches sorted by hygiene score for the health panel
  const sortedBranches = useMemo(() => {
    return [...branches]
      .filter(b => b.branchType !== 'production')
      .sort((a, b) => {
        const scoreA = parseInt(a.kpis.hygieneScore) || 0
        const scoreB = parseInt(b.kpis.hygieneScore) || 0
        return scoreA - scoreB
      })
  }, [branches])

  const getHygieneColor = (score: number) => {
    if (score >= 95) return 'bg-emerald-500'
    if (score >= 92) return 'bg-amber-500'
    return 'bg-red-500'
  }

  const getHygieneBgColor = (score: number) => {
    if (score >= 95) return 'bg-emerald-50 border-emerald-200'
    if (score >= 92) return 'bg-amber-50 border-amber-200'
    return 'bg-red-50 border-red-200'
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-primary/20 rounded-full animate-pulse"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10">
              <Activity className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
          </div>
          <p className="text-muted-foreground">
            Monitor and manage your Mikana operations
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Stats Overview - Bento Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Branches Stat */}
        <Card className="relative overflow-hidden group hover:shadow-md transition-all duration-300 animate-slide-up opacity-0 stagger-1" style={{ animationFillMode: 'forwards' }}>
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/10 to-transparent rounded-bl-full"></div>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Branches</p>
                <p className="text-3xl font-bold text-foreground mt-1">{stats?.branches.total || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {Object.keys(stats?.branches.byLocation || {}).length} locations
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-blue-100 text-blue-600">
                <Building2 className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recipes Stat */}
        <Card className="relative overflow-hidden group hover:shadow-md transition-all duration-300 animate-slide-up opacity-0 stagger-2" style={{ animationFillMode: 'forwards' }}>
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-orange-500/10 to-transparent rounded-bl-full"></div>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">CK Recipes</p>
                <p className="text-3xl font-bold text-foreground mt-1">{stats?.recipes.total || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {Object.keys(stats?.recipes.byCategory || {}).length} categories
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-orange-100 text-orange-600">
                <ChefHat className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dispatches Stat */}
        <Card className="relative overflow-hidden group hover:shadow-md transition-all duration-300 animate-slide-up opacity-0 stagger-3" style={{ animationFillMode: 'forwards' }}>
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-500/10 to-transparent rounded-bl-full"></div>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Dispatches</p>
                <p className="text-3xl font-bold text-foreground mt-1">{stats?.dispatches.total || 0}</p>
                <div className="flex items-center gap-1 mt-1">
                  {(stats?.dispatches.pending || 0) > 0 && (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-amber-100 text-amber-700 border-0">
                      {stats?.dispatches.pending} pending
                    </Badge>
                  )}
                  {(stats?.dispatches.inProgress || 0) > 0 && (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-blue-100 text-blue-700 border-0">
                      {stats?.dispatches.inProgress} active
                    </Badge>
                  )}
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-purple-100 text-purple-600">
                <Truck className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Hygiene Avg Stat */}
        <Card className="relative overflow-hidden group hover:shadow-md transition-all duration-300 animate-slide-up opacity-0 stagger-4" style={{ animationFillMode: 'forwards' }}>
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-bl-full"></div>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg. Hygiene</p>
                <p className="text-3xl font-bold text-foreground mt-1">{stats?.branches.avgHygiene || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats?.branches.lowHygieneCount || 0} below threshold
                </p>
              </div>
              <div className={`p-2.5 rounded-xl ${(stats?.branches.avgHygiene || 0) >= 93 ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sales Snapshot */}
      {salesData && (
        <Card className="border-l-4 border-l-emerald-500 animate-slide-up opacity-0 stagger-5" style={{ animationFillMode: 'forwards' }}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-emerald-600" />
                Sales Snapshot
              </CardTitle>
              <Link href="/admin/analytics">
                <Button variant="ghost" size="sm" className="text-xs gap-1 h-7">
                  View Analytics
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Today's Revenue */}
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Today&apos;s Revenue</p>
                <p className="text-xl font-bold text-foreground">
                  {new Intl.NumberFormat('en-AE', { style: 'currency', currency: 'AED', maximumFractionDigits: 0 }).format(salesData.today.revenue)}
                </p>
                <div className={`flex items-center gap-1 text-xs font-medium ${salesData.today.changes.revenue >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {salesData.today.changes.revenue >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {salesData.today.changes.revenue >= 0 ? '+' : ''}{salesData.today.changes.revenue}% vs yesterday
                </div>
              </div>

              {/* This Month Revenue */}
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">This Month</p>
                <p className="text-xl font-bold text-foreground">
                  {salesData.thisMonth.revenue >= 1000000 
                    ? `AED ${(salesData.thisMonth.revenue / 1000000).toFixed(1)}M`
                    : salesData.thisMonth.revenue >= 1000
                    ? `AED ${(salesData.thisMonth.revenue / 1000).toFixed(0)}K`
                    : new Intl.NumberFormat('en-AE', { style: 'currency', currency: 'AED', maximumFractionDigits: 0 }).format(salesData.thisMonth.revenue)
                  }
                </p>
                <div className={`flex items-center gap-1 text-xs font-medium ${salesData.thisMonth.changes.revenue >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {salesData.thisMonth.changes.revenue >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {salesData.thisMonth.changes.revenue >= 0 ? '+' : ''}{salesData.thisMonth.changes.revenue}% vs last month
                </div>
              </div>

              {/* Today's Units */}
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Units Sold Today</p>
                <p className="text-xl font-bold text-foreground">
                  {new Intl.NumberFormat('en-AE').format(salesData.today.units)}
                </p>
                <div className={`flex items-center gap-1 text-xs font-medium ${salesData.today.changes.units >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {salesData.today.changes.units >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {salesData.today.changes.units >= 0 ? '+' : ''}{salesData.today.changes.units}% vs yesterday
                </div>
              </div>

              {/* Today's Orders */}
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Orders Today</p>
                <p className="text-xl font-bold text-foreground">
                  {new Intl.NumberFormat('en-AE').format(salesData.today.orders)}
                </p>
                <div className={`flex items-center gap-1 text-xs font-medium ${salesData.today.changes.orders >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {salesData.today.changes.orders >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {salesData.today.changes.orders >= 0 ? '+' : ''}{salesData.today.changes.orders}% vs yesterday
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alerts Panel - Takes 1 column */}
        <Card className="lg:col-span-1 border-l-4 border-l-amber-500 animate-slide-up opacity-0 stagger-5" style={{ animationFillMode: 'forwards' }}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                Attention Required
              </CardTitle>
              {(stats?.alerts.length || 0) > 0 && (
                <Badge className="bg-amber-100 text-amber-700 border-0">
                  {stats?.alerts.length}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {(stats?.alerts.length || 0) === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="p-3 rounded-full bg-emerald-100 mb-3">
                  <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                </div>
                <p className="text-sm font-medium text-foreground">All Clear!</p>
                <p className="text-xs text-muted-foreground">No issues require attention</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1 dashboard-scroll">
                {stats?.alerts.slice(0, 5).map((alert) => (
                  <Link 
                    key={alert.id} 
                    href={alert.link || '#'}
                    className="block"
                  >
                    <div className={`
                      p-3 rounded-lg border transition-all duration-200
                      hover:shadow-sm hover:border-primary/30
                      ${alert.type === 'warning' ? 'bg-amber-50/50 border-amber-200' : 
                        alert.type === 'info' ? 'bg-blue-50/50 border-blue-200' : 
                        'bg-emerald-50/50 border-emerald-200'}
                    `}>
                      <p className="text-sm font-medium text-foreground line-clamp-1">
                        {alert.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                        {alert.description}
                      </p>
                    </div>
                  </Link>
                ))}
                {(stats?.alerts.length || 0) > 5 && (
                  <p className="text-xs text-center text-muted-foreground pt-2">
                    +{(stats?.alerts.length || 0) - 5} more alerts
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Branch Health Overview - Takes 2 columns */}
        <Card className="lg:col-span-2 animate-slide-up opacity-0 stagger-6" style={{ animationFillMode: 'forwards' }}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                Branch Health Overview
              </CardTitle>
              <Link href="/admin/branches">
                <Button variant="ghost" size="sm" className="text-xs gap-1 h-7">
                  View All
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {/* Location Summary */}
            <div className="flex flex-wrap gap-2 mb-4">
              {Object.entries(stats?.branches.byLocation || {}).map(([location, count]) => (
                <div key={location} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/50 text-xs">
                  <MapPin className="h-3 w-3 text-muted-foreground" />
                  <span className="font-medium">{location}</span>
                  <span className="text-muted-foreground">({count})</span>
                </div>
              ))}
            </div>

            {/* Branch Health Bars */}
            <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1 dashboard-scroll">
              {sortedBranches.map((branch) => {
                const score = parseInt(branch.kpis.hygieneScore) || 0
                return (
                  <Link key={branch.slug} href={`/admin/branches/${branch.slug}`}>
                    <div className={`
                      flex items-center gap-3 p-2 rounded-lg border transition-all duration-200
                      hover:shadow-sm hover:border-primary/30
                      ${getHygieneBgColor(score)}
                    `}>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium truncate">{branch.name}</p>
                          <span className={`
                            text-xs font-semibold px-2 py-0.5 rounded-full
                            ${score >= 95 ? 'bg-emerald-100 text-emerald-700' : 
                              score >= 92 ? 'bg-amber-100 text-amber-700' : 
                              'bg-red-100 text-red-700'}
                          `}>
                            {score}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full progress-bar-animate ${getHygieneColor(score)}`}
                              style={{ width: `${score}%` }}
                            ></div>
                          </div>
                          <span className="text-[10px] text-muted-foreground">{branch.location}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Management Cards */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          Quick Management
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Recipes Management */}
          <Link href="/admin/recipes">
            <Card className="h-full hover:shadow-lg hover:border-primary/30 transition-all duration-300 cursor-pointer group">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-orange-100 to-orange-50 text-orange-600 group-hover:scale-110 transition-transform duration-300">
                    <ChefHat className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground">Recipe Manager (CK)</h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      Full recipes for Central Kitchen with cooking instructions
                    </p>
                    <div className="flex items-center gap-2 mt-3">
                      <Badge variant="secondary" className="text-xs">
                        {stats?.recipes.total || 0} recipes
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {Object.keys(stats?.recipes.byCategory || {}).length} categories
                      </Badge>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Recipe Instructions */}
          <Link href="/admin/recipe-instructions">
            <Card className="h-full hover:shadow-lg hover:border-primary/30 transition-all duration-300 cursor-pointer group">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-rose-100 to-rose-50 text-rose-600 group-hover:scale-110 transition-transform duration-300">
                    <Flame className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground">Recipe Instructions</h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      Reheating & assembly instructions for branches
                    </p>
                    <div className="flex items-center gap-2 mt-3">
                      <Badge variant="secondary" className="text-xs">
                        {stats?.instructions.total || 0} instructions
                      </Badge>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Production Schedules */}
          <Link href="/admin/production-schedules">
            <Card className="h-full hover:shadow-lg hover:border-primary/30 transition-all duration-300 cursor-pointer group">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-violet-100 to-violet-50 text-violet-600 group-hover:scale-110 transition-transform duration-300">
                    <Factory className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground">Production Schedules</h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      Weekly production plans for Central Kitchen
                    </p>
                    <div className="flex items-center gap-2 mt-3">
                      <Badge variant="secondary" className="text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        Weekly plans
                      </Badge>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Branch Management */}
          <Link href="/admin/branches">
            <Card className="h-full hover:shadow-lg hover:border-primary/30 transition-all duration-300 cursor-pointer group">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 text-blue-600 group-hover:scale-110 transition-transform duration-300">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground">Branch Management</h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      Edit branch information, contacts, and operating hours
                    </p>
                    <div className="flex items-center gap-2 mt-3">
                      <Badge variant="secondary" className="text-xs">
                        {stats?.branches.total || 0} branches
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {Object.keys(stats?.branches.byLocation || {}).length} locations
                      </Badge>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Notifications */}
          <Link href="/admin/notifications">
            <Card className="h-full hover:shadow-lg hover:border-primary/30 transition-all duration-300 cursor-pointer group">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-amber-100 to-amber-50 text-amber-600 group-hover:scale-110 transition-transform duration-300">
                    <Bell className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground">Notifications</h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      Create announcements, patch notes, and alerts for employees
                    </p>
                    <div className="flex items-center gap-2 mt-3">
                      <Badge variant="secondary" className="text-xs">
                        {stats?.notifications.active || 0} active
                      </Badge>
                      {(stats?.notifications.expiringSoon || 0) > 0 && (
                        <Badge variant="outline" className="text-xs text-amber-600 border-amber-300">
                          {stats?.notifications.expiringSoon} expiring soon
                        </Badge>
                      )}
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Sales Analytics */}
          <Link href="/admin/analytics">
            <Card className="h-full hover:shadow-lg hover:border-primary/30 transition-all duration-300 cursor-pointer group">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform duration-300">
                    <BarChart3 className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground">Sales Analytics</h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      Revenue trends, branch performance, and product insights
                    </p>
                    <div className="flex items-center gap-2 mt-3">
                      <Badge variant="secondary" className="text-xs bg-emerald-100 text-emerald-700 border-0">
                        <DollarSign className="h-3 w-3 mr-1" />
                        Live Data
                      </Badge>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Dispatch Control - Coming Soon */}
          <Card className="h-full opacity-60 cursor-not-allowed">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-gray-100 text-gray-400">
                  <Package className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-muted-foreground">Dispatch Control</h3>
                    <Badge variant="secondary" className="text-[10px] px-2 py-0.5">
                      Soon
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    Manage dispatch settings and archive
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer Info */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-dashed">
        <CardContent className="py-4">
          <div className="flex items-center gap-4">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm">Need Help?</h3>
              <p className="text-xs text-muted-foreground">
                Contact your system administrator for additional features or support. More management tools are under development.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
