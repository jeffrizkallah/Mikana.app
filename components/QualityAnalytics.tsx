'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { QualityCheckDetailModal } from '@/components/QualityCheckDetailModal'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts'
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Star,
  Eye,
  Sparkles,
  RefreshCw,
  Calendar,
  ChevronDown,
  ChevronUp,
  Target,
  Award,
  AlertCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface AnalyticsData {
  scoresOverTime: any[]
  branchPerformance: any[]
  sectionPerformance: any[]
  mealServiceComparison: any[]
  topProducts: any[]
  bottomProducts: any[]
  temperatureCompliance: any[]
  scoreDistribution: any[]
}

interface AIAnalysis {
  summary: string
  insights: Array<{
    type: 'critical' | 'warning' | 'success' | 'info'
    title: string
    description: string
    branches?: string[]
    products?: string[]
  }>
  commonIssues: Array<{
    issue: string
    frequency: number
    branches?: string[]
    sections?: string[]
  }>
  topPerformers: Array<{
    name: string
    type: 'branch' | 'product'
    avgScore: number
    note: string
  }>
  lowPerformers: Array<{
    name: string
    type: 'branch' | 'product'
    avgScore: number
    criticalProducts?: string[]
    note: string
  }>
  recommendations: Array<{
    priority: 'high' | 'medium' | 'low'
    action: string
    target: string
    expectedImpact: string
  }>
  trends?: {
    mealServiceComparison?: string
    sectionComparison?: string
    temperatureIssues?: string
    portionConsistency?: string
  }
  metadata?: {
    periodType: string
    periodStart: string
    periodEnd: string
    totalSubmissions: number
    branchesAnalyzed: number
    generationCost: number
    generationTimeMs: number
  }
}

interface QualityAnalyticsProps {
  startDate: string
  endDate: string
  period: string
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export function QualityAnalytics({ startDate, endDate, period }: QualityAnalyticsProps) {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null)
  const [loading, setLoading] = useState(true)
  const [generatingAI, setGeneratingAI] = useState(false)
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<number | null>(null)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    insights: true,
    charts: true,
    recommendations: true,
  })

  useEffect(() => {
    fetchAnalyticsData()
    fetchAIAnalysis()
  }, [startDate, endDate])

  const fetchAnalyticsData = async () => {
    try {
      const res = await fetch(
        `/api/quality-checks/analytics?startDate=${startDate}&endDate=${endDate}`
      )
      if (res.ok) {
        const data = await res.json()
        setAnalyticsData(data)
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAIAnalysis = async () => {
    try {
      // Try to get cached analysis first
      const res = await fetch(
        `/api/quality-checks/analyze?periodType=${period}&startDate=${startDate}&endDate=${endDate}`
      )
      if (res.ok) {
        const data = await res.json()
        if (data && data.length > 0) {
          const cached = data[0]
          setAiAnalysis({
            summary: cached.summary,
            insights: cached.insights,
            commonIssues: cached.common_issues || [],
            topPerformers: cached.top_performers || [],
            lowPerformers: cached.low_performers || [],
            recommendations: cached.recommendations || [],
            trends: cached.trends || {},
            metadata: {
              periodType: cached.period_type,
              periodStart: cached.period_start,
              periodEnd: cached.period_end,
              totalSubmissions: cached.total_submissions,
              branchesAnalyzed: cached.branches_analyzed?.length || 0,
              generationCost: parseFloat(cached.generation_cost || '0'),
              generationTimeMs: cached.generation_time_ms,
            }
          })
        }
      }
    } catch (error) {
      console.error('Error fetching AI analysis:', error)
    }
  }

  const generateAIAnalysis = async () => {
    setGeneratingAI(true)
    try {
      const res = await fetch('/api/quality-checks/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          periodType: period,
          startDate,
          endDate,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        if (data.analysis) {
          setAiAnalysis(data.analysis)
        }
      } else {
        const error = await res.json()
        const errorMessage = error.details || error.error || 'Unknown error'
        console.error('API Error:', error)
        alert(`Failed to generate analysis:\n\n${errorMessage}\n\nCheck browser console for more details.`)
      }
    } catch (error: any) {
      console.error('Error generating AI analysis:', error)
      alert(`Failed to generate AI analysis:\n\n${error.message || error}\n\nCheck browser console for more details.`)
    } finally {
      setGeneratingAI(false)
    }
  }

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-red-500" />
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-amber-500" />
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      default:
        return <Star className="h-5 w-5 text-blue-500" />
    }
  }

  const getPriorityBadge = (priority: string) => {
    const colors = {
      high: 'bg-red-100 text-red-700 border-red-300',
      medium: 'bg-amber-100 text-amber-700 border-amber-300',
      low: 'bg-blue-100 text-blue-700 border-blue-300',
    }
    return colors[priority as keyof typeof colors] || colors.medium
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (!analyticsData) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No analytics data available for this period.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* AI Analysis Section */}
      <Card className="border border-slate-200 bg-gradient-to-br from-slate-50/50 to-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-50">
                <Sparkles className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-xl">AI-Generated Insights</CardTitle>
                {aiAnalysis?.metadata && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {aiAnalysis.metadata.totalSubmissions} submissions analyzed • 
                    Generated {new Date(aiAnalysis.metadata.periodStart).toLocaleDateString()} - {new Date(aiAnalysis.metadata.periodEnd).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
            <Button
              onClick={generateAIAnalysis}
              disabled={generatingAI}
              variant="outline"
              className="gap-2"
            >
              {generatingAI ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  {aiAnalysis ? 'Regenerate' : 'Generate'} Analysis
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {aiAnalysis ? (
            <>
              {/* Executive Summary */}
              <div className="p-4 bg-white rounded-lg border border-slate-200">
                <p className="text-lg leading-relaxed">{aiAnalysis.summary}</p>
              </div>

              {/* Key Insights */}
              <div>
                <button
                  onClick={() => toggleSection('insights')}
                  className="flex items-center gap-2 mb-3 font-semibold text-lg hover:text-blue-600 transition-colors"
                >
                  {expandedSections.insights ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  Key Insights ({aiAnalysis.insights?.length || 0})
                </button>
                {expandedSections.insights && (
                  <div className="grid gap-3">
                    {aiAnalysis.insights?.map((insight, i) => (
                      <div
                        key={i}
                        className={cn(
                          "p-4 rounded-lg border-l-4",
                          insight.type === 'critical' && "bg-red-50 border-l-red-500",
                          insight.type === 'warning' && "bg-amber-50 border-l-amber-500",
                          insight.type === 'success' && "bg-green-50 border-l-green-500",
                          insight.type === 'info' && "bg-blue-50 border-l-blue-500"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          {getInsightIcon(insight.type)}
                          <div className="flex-1">
                            <h4 className="font-semibold mb-1">{insight.title}</h4>
                            <p className="text-sm text-muted-foreground">{insight.description}</p>
                            {insight.branches && insight.branches.length > 0 && (
                              <div className="flex gap-2 mt-2 flex-wrap">
                                {insight.branches.map((branch, j) => (
                                  <Badge key={j} variant="outline" className="text-xs">
                                    {branch}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Common Issues */}
              {aiAnalysis.commonIssues && aiAnalysis.commonIssues.length > 0 && (
                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Common Issues
                  </h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    {aiAnalysis.commonIssues.map((issue, i) => (
                      <div key={i} className="p-4 bg-white rounded-lg border">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold">{issue.issue}</h4>
                          <Badge variant="secondary">{issue.frequency}×</Badge>
                        </div>
                        {issue.branches && issue.branches.length > 0 && (
                          <p className="text-sm text-muted-foreground">
                            Affects: {issue.branches.join(', ')}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Top & Low Performers */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Top Performers */}
                {aiAnalysis.topPerformers && aiAnalysis.topPerformers.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-lg mb-3 flex items-center gap-2 text-green-700">
                      <Award className="h-5 w-5" />
                      Top Performers
                    </h3>
                    <div className="space-y-2">
                      {aiAnalysis.topPerformers.map((performer, i) => (
                        <div key={i} className="p-3 bg-green-50 rounded-lg border border-green-200">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold">{performer.name}</span>
                            <Badge className="bg-green-600">{performer.avgScore}/5</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{performer.note}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Low Performers */}
                {aiAnalysis.lowPerformers && aiAnalysis.lowPerformers.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-lg mb-3 flex items-center gap-2 text-red-700">
                      <TrendingDown className="h-5 w-5" />
                      Needs Improvement
                    </h3>
                    <div className="space-y-2">
                      {aiAnalysis.lowPerformers.map((performer, i) => (
                        <div key={i} className="p-3 bg-red-50 rounded-lg border border-red-200">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold">{performer.name}</span>
                            <Badge variant="destructive">{performer.avgScore}/5</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{performer.note}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Recommendations */}
              {aiAnalysis.recommendations && aiAnalysis.recommendations.length > 0 && (
                <div>
                  <button
                    onClick={() => toggleSection('recommendations')}
                    className="flex items-center gap-2 mb-3 font-semibold text-lg hover:text-blue-600 transition-colors"
                  >
                    {expandedSections.recommendations ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    Actionable Recommendations ({aiAnalysis.recommendations.length})
                  </button>
                  {expandedSections.recommendations && (
                    <div className="space-y-3">
                      {aiAnalysis.recommendations.map((rec, i) => (
                        <div key={i} className="p-4 bg-white rounded-lg border-l-4 border-l-blue-500">
                          <div className="flex items-start gap-3">
                            <Badge className={cn("mt-0.5", getPriorityBadge(rec.priority))}>
                              {rec.priority}
                            </Badge>
                            <div className="flex-1">
                              <h4 className="font-semibold mb-1">{rec.action}</h4>
                              <p className="text-sm text-muted-foreground mb-1">Target: {rec.target}</p>
                              <p className="text-sm text-green-700">💡 Expected: {rec.expectedImpact}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <Sparkles className="h-12 w-12 mx-auto mb-4 text-slate-300" />
              <p className="text-muted-foreground mb-4">
                No AI analysis available for this period yet.
              </p>
              <Button onClick={generateAIAnalysis} disabled={generatingAI} className="gap-2">
                <Sparkles className="h-4 w-4" />
                Generate AI Analysis
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                This will analyze all submissions and provide insights
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Charts Section */}
      <div>
        <button
          onClick={() => toggleSection('charts')}
          className="flex items-center gap-2 mb-4 font-semibold text-xl hover:text-primary transition-colors"
        >
          {expandedSections.charts ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          Performance Charts
        </button>

        {expandedSections.charts && (
          <div className="grid gap-6">
            {/* Scores Over Time */}
            {analyticsData.scoresOverTime.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Quality Scores Trend
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={analyticsData.scoresOverTime}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} />
                      <YAxis domain={[0, 5]} />
                      <Tooltip 
                        labelFormatter={(date) => new Date(date).toLocaleDateString()}
                        formatter={(value: any) => [Number(value).toFixed(2), '']}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="avg_taste" stroke="#f59e0b" name="Taste" strokeWidth={2} />
                      <Line type="monotone" dataKey="avg_appearance" stroke="#3b82f6" name="Appearance" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Branch Performance */}
            {analyticsData.branchPerformance.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Branch Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={analyticsData.branchPerformance}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="branch_name" angle={-45} textAnchor="end" height={100} />
                      <YAxis domain={[0, 5]} />
                      <Tooltip formatter={(value: any) => Number(value).toFixed(2)} />
                      <Legend />
                      <Bar dataKey="avg_taste" fill="#f59e0b" name="Taste" />
                      <Bar dataKey="avg_appearance" fill="#3b82f6" name="Appearance" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Section & Meal Service Comparison */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Section Performance */}
              {analyticsData.sectionPerformance.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Section Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={analyticsData.sectionPerformance}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="section" />
                        <YAxis domain={[0, 5]} />
                        <Tooltip formatter={(value: any) => Number(value).toFixed(2)} />
                        <Bar dataKey="avg_overall" fill="#10b981" name="Avg Score" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              {/* Meal Service Comparison */}
              {analyticsData.mealServiceComparison.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Meal Service Comparison</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={analyticsData.mealServiceComparison}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="meal_service" />
                        <YAxis domain={[0, 5]} />
                        <Tooltip formatter={(value: any) => Number(value).toFixed(2)} />
                        <Legend />
                        <Bar dataKey="avg_taste" fill="#f59e0b" name="Taste" />
                        <Bar dataKey="avg_appearance" fill="#3b82f6" name="Appearance" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Top & Bottom Products */}
            <div className="grid md:grid-cols-2 gap-6">
              {analyticsData.topProducts.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-green-700 flex items-center gap-2">
                      <Star className="h-5 w-5" />
                      Top Products
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">
                      Consistently excellent (≥4.0 score, 3+ checks)
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {analyticsData.topProducts.slice(0, 5).map((product: any, i: number) => (
                        <div key={i} className="flex items-center justify-between p-2 bg-green-50 rounded">
                          <div>
                            <p className="font-medium text-sm">{product.product_name}</p>
                            <p className="text-xs text-muted-foreground">{product.section} • {product.check_count} checks</p>
                          </div>
                          <Badge className="bg-green-600">{Number(product.avg_overall).toFixed(1)}/5</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {analyticsData.bottomProducts.length > 0 ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-red-700 flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" />
                      Products Needing Attention
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">
                      Poor quality scores (&lt;3.5) - immediate action needed
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {analyticsData.bottomProducts.slice(0, 5).map((product: any, i: number) => (
                        <div key={i} className="flex items-center justify-between p-2 bg-red-50 rounded border border-red-200">
                          <div>
                            <p className="font-medium text-sm">{product.product_name}</p>
                            <p className="text-xs text-muted-foreground">{product.section} • {product.check_count} {product.check_count === 1 ? 'check' : 'checks'}</p>
                          </div>
                          <Badge variant="destructive">{Number(product.avg_overall).toFixed(1)}/5</Badge>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-3 italic">
                      Note: These are average scores across multiple submissions. See the Quality Control page for individual submissions.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-green-700 flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5" />
                      Products Needing Attention
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-green-500" />
                      <p className="font-medium text-green-700">Excellent Performance!</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        All products are scoring 3.5 or above
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Quality Check Detail Modal */}
      <QualityCheckDetailModal
        submissionId={selectedSubmissionId}
        onClose={() => setSelectedSubmissionId(null)}
      />
    </div>
  )
}

