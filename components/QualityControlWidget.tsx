'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ClipboardCheck,
  Coffee,
  Sun,
  CheckCircle2,
  Clock,
  Star,
  Eye,
  ChevronRight,
  AlertCircle,
  Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface QualityControlWidgetProps {
  branchSlug: string
  branchName: string
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

export function QualityControlWidget({ branchSlug, branchName }: QualityControlWidgetProps) {
  const [todayChecks, setTodayChecks] = useState<QualityCheck[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0]
      const res = await fetch(`/api/quality-checks?branch=${branchSlug}&startDate=${today}&endDate=${today}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      })
      
      if (res.ok) {
        const data = await res.json()
        setTodayChecks(data)
        setError(null)
      } else {
        setError('Failed to load quality checks')
      }
    } catch (err) {
      console.error('Error fetching quality checks:', err)
      setError('Failed to load quality checks')
    } finally {
      setLoading(false)
    }
  }

  // Initial fetch
  useEffect(() => {
    fetchData()
  }, [branchSlug])

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchData()
    }, 30000)

    return () => clearInterval(interval)
  }, [branchSlug])

  // Calculate stats
  const breakfastChecks = todayChecks.filter(c => c.mealService === 'breakfast')
  const lunchChecks = todayChecks.filter(c => c.mealService === 'lunch')
  const hasBreakfastCheck = breakfastChecks.length > 0
  const hasLunchCheck = lunchChecks.length > 0
  const bothComplete = hasBreakfastCheck && hasLunchCheck

  // Get recent submissions (last 3)
  const recentSubmissions = [...todayChecks]
    .sort((a, b) => new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime())
    .slice(0, 3)

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 flex flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">Loading quality checks...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn(
      "transition-all",
      bothComplete && "border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50/50 to-emerald-50/50 dark:from-green-950/20 dark:to-emerald-950/20"
    )}>
      <CardHeader className="px-4 py-3 md:px-6 md:py-4">
        <CardTitle className="text-base sm:text-lg md:text-xl flex items-center gap-2">
          <ClipboardCheck className={cn(
            "h-5 w-5",
            bothComplete ? "text-green-600" : "text-primary"
          )} />
          Quality Control
        </CardTitle>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          {bothComplete 
            ? "Great progress! Remember to check all items displayed today"
            : "Complete your daily food quality checks"
          }
        </p>
      </CardHeader>
      
      <CardContent className="px-4 py-3 md:px-6 md:py-4 space-y-4">
        {/* Status Cards - Compact */}
        <div className="grid grid-cols-2 gap-2">
          {/* Breakfast Card */}
          <div className={cn(
            "rounded-lg p-3 transition-all border",
            hasBreakfastCheck 
              ? "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800" 
              : "bg-gray-50 dark:bg-gray-900/30 border-gray-200 dark:border-gray-800"
          )}>
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                hasBreakfastCheck 
                  ? "bg-green-100 dark:bg-green-900/50" 
                  : "bg-gray-100 dark:bg-gray-800"
              )}>
                <Coffee className={cn(
                  "h-4 w-4",
                  hasBreakfastCheck ? "text-green-600" : "text-gray-400"
                )} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Breakfast</p>
                <div className="flex items-center gap-1">
                  <span className={cn(
                    "text-lg font-bold",
                    hasBreakfastCheck ? "text-green-600" : "text-gray-500"
                  )}>
                    {breakfastChecks.length}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {breakfastChecks.length === 1 ? 'item' : 'items'}
                  </span>
                </div>
              </div>
              {hasBreakfastCheck && (
                <CheckCircle2 className="h-4 w-4 text-green-600 ml-auto shrink-0" />
              )}
            </div>
          </div>

          {/* Lunch Card */}
          <div className={cn(
            "rounded-lg p-3 transition-all border",
            hasLunchCheck 
              ? "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800" 
              : "bg-gray-50 dark:bg-gray-900/30 border-gray-200 dark:border-gray-800"
          )}>
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                hasLunchCheck 
                  ? "bg-green-100 dark:bg-green-900/50" 
                  : "bg-gray-100 dark:bg-gray-800"
              )}>
                <Sun className={cn(
                  "h-4 w-4",
                  hasLunchCheck ? "text-green-600" : "text-gray-400"
                )} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Lunch</p>
                <div className="flex items-center gap-1">
                  <span className={cn(
                    "text-lg font-bold",
                    hasLunchCheck ? "text-green-600" : "text-gray-500"
                  )}>
                    {lunchChecks.length}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {lunchChecks.length === 1 ? 'item' : 'items'}
                  </span>
                </div>
              </div>
              {hasLunchCheck && (
                <CheckCircle2 className="h-4 w-4 text-green-600 ml-auto shrink-0" />
              )}
            </div>
          </div>
        </div>

        {/* Reminder Message */}
        {todayChecks.length > 0 && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
            <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-700 dark:text-amber-400">
              Remember to submit quality checks for <strong>all items</strong> displayed or sold today, not just a few.
            </p>
          </div>
        )}

        {/* CTA Button */}
        <Link href={`/branch/${branchSlug}/quality-check`} className="block">
          <Button 
            className={cn(
              "w-full h-12 text-base font-medium",
              bothComplete 
                ? "bg-blue-600 hover:bg-blue-700" 
                : "bg-green-600 hover:bg-green-700"
            )}
          >
            <ClipboardCheck className="h-5 w-5 mr-2" />
            {bothComplete ? "Add More Items" : "Start Quality Check"}
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </Link>

        {/* Recent Submissions */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-muted-foreground">Recent Submissions</p>
            {todayChecks.length > 3 && (
              <Link href={`/branch/${branchSlug}/quality-check`} className="text-xs text-primary hover:underline">
                View All ({todayChecks.length})
              </Link>
            )}
          </div>
          
          {recentSubmissions.length > 0 ? (
            <div className="space-y-2">
              {recentSubmissions.map((check) => (
                <div 
                  key={check.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {check.mealService === 'breakfast' ? (
                      <Coffee className="h-4 w-4 text-amber-600 shrink-0" />
                    ) : (
                      <Sun className="h-4 w-4 text-orange-500 shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{check.productName}</p>
                      <p className="text-xs text-muted-foreground">
                        {check.section} • {new Date(check.submissionDate).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="outline" className="text-yellow-600 border-yellow-200 bg-yellow-50 text-xs px-2">
                      <Star className="h-3 w-3 mr-1" />
                      {check.tasteScore}
                    </Badge>
                    <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50 text-xs px-2">
                      <Eye className="h-3 w-3 mr-1" />
                      {check.appearanceScore}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 bg-muted/30 rounded-lg border-2 border-dashed">
              <ClipboardCheck className="h-8 w-8 mx-auto text-gray-300 mb-2" />
              <p className="text-sm text-muted-foreground">No checks submitted today</p>
              <p className="text-xs text-muted-foreground mt-1">Start your first quality check!</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
