'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { TopNav } from '@/components/TopNav'
import { Footer } from '@/components/Footer'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  ArrowLeft, 
  CheckCircle2, 
  AlertTriangle, 
  Package, 
  Save,
  XCircle
} from 'lucide-react'
import { loadBranches } from '@/lib/data'
import type { BranchDispatch, DispatchItem } from '@/lib/data'

interface ReceivingPageProps {
  params: {
    id: string
    slug: string
  }
}

export default function ReceivingChecklistPage({ params }: ReceivingPageProps) {
  const [branchDispatch, setBranchDispatch] = useState<BranchDispatch | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [receivedBy, setReceivedBy] = useState('')
  const [overallNotes, setOverallNotes] = useState('')
  const router = useRouter()

  const branches = loadBranches()
  const branch = branches.find(b => b.slug === params.slug)

  useEffect(() => {
    fetchDispatch()
  }, [params.id, params.slug])

  const fetchDispatch = async () => {
    try {
      const response = await fetch('/api/dispatch')
      const dispatches = await response.json()
      
      const dispatch = dispatches.find((d: any) => d.id === params.id)
      if (dispatch) {
        const bd = dispatch.branchDispatches.find((bd: any) => bd.branchSlug === params.slug)
        if (bd) {
          setBranchDispatch(bd)
          setReceivedBy(bd.receivedBy || '')
          setOverallNotes(bd.overallNotes || '')
        }
      }
      
      setLoading(false)
    } catch (error) {
      console.error('Error fetching dispatch:', error)
      setLoading(false)
    }
  }

  const handleItemCheck = (itemId: string, checked: boolean) => {
    if (!branchDispatch) return

    const updatedItems = branchDispatch.items.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          checked,
          receivedQty: checked ? item.orderedQty : null,
          issue: checked ? null : item.issue
        }
      }
      return item
    })

    setBranchDispatch({
      ...branchDispatch,
      items: updatedItems
    })
  }

  const handleIssue = (itemId: string, issue: 'missing' | 'damaged' | 'partial' | null) => {
    if (!branchDispatch) return

    const updatedItems = branchDispatch.items.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          issue,
          checked: issue === null,
          receivedQty: issue === null ? item.orderedQty : (issue === 'missing' ? 0 : null)
        }
      }
      return item
    })

    setBranchDispatch({
      ...branchDispatch,
      items: updatedItems
    })
  }

  const handleReceivedQty = (itemId: string, qty: string) => {
    if (!branchDispatch) return

    const numQty = parseFloat(qty) || 0

    const updatedItems = branchDispatch.items.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          receivedQty: numQty
        }
      }
      return item
    })

    setBranchDispatch({
      ...branchDispatch,
      items: updatedItems
    })
  }

  const handleNotes = (itemId: string, notes: string) => {
    if (!branchDispatch) return

    const updatedItems = branchDispatch.items.map(item => {
      if (item.id === itemId) {
        return { ...item, notes }
      }
      return item
    })

    setBranchDispatch({
      ...branchDispatch,
      items: updatedItems
    })
  }

  const saveProgress = async () => {
    if (!branchDispatch) return

    setSaving(true)
    
    try {
      await fetch(`/api/dispatch/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          branchSlug: params.slug,
          items: branchDispatch.items,
          overallNotes,
          status: 'receiving'
        })
      })
      
      alert('✓ Progress saved successfully!')
      setSaving(false)
    } catch (error) {
      alert('Error saving progress. Please try again.')
      setSaving(false)
    }
  }

  const completeDispatch = async () => {
    if (!branchDispatch) return
    
    if (!receivedBy.trim()) {
      alert('Please enter the name of the person receiving this dispatch')
      return
    }

    const uncheckedItems = branchDispatch.items.filter(item => !item.checked && item.issue === null)
    if (uncheckedItems.length > 0) {
      const confirm = window.confirm(
        `${uncheckedItems.length} items are not checked yet. Do you want to complete anyway?`
      )
      if (!confirm) return
    }

    setSaving(true)
    
    try {
      await fetch(`/api/dispatch/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          branchSlug: params.slug,
          items: branchDispatch.items,
          receivedBy,
          receivedAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
          overallNotes,
          status: 'completed'
        })
      })
      
      alert('✅ Dispatch completed successfully!')
      router.push(`/branch/${params.slug}`)
    } catch (error) {
      alert('Error completing dispatch. Please try again.')
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Package className="h-12 w-12 animate-pulse mx-auto mb-4 text-muted-foreground" />
          <div>Loading dispatch...</div>
        </div>
      </div>
    )
  }

  if (!branchDispatch || !branch) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <XCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <div className="text-xl font-semibold mb-2">Dispatch not found</div>
          <Link href={`/branch/${params.slug}`}>
            <Button>Return to Branch</Button>
          </Link>
        </div>
      </div>
    )
  }

  const checkedCount = branchDispatch.items.filter(item => item.checked).length
  const totalCount = branchDispatch.items.length
  const progressPercent = Math.round((checkedCount / totalCount) * 100)
  const issuesCount = branchDispatch.items.filter(item => item.issue !== null).length

  const isCompleted = branchDispatch.status === 'completed'

  return (
    <div className="min-h-screen flex flex-col">
      <TopNav />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: branch.name, href: `/branch/${params.slug}` },
            { label: 'Receiving Checklist' },
          ]}
        />

        {/* Header */}
        <div className="mb-6">
          <Link href={`/branch/${params.slug}`}>
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Branch
            </Button>
          </Link>
          
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">📦 Receiving Checklist</h1>
              <p className="text-lg text-muted-foreground">{branch.name}</p>
            </div>
            {isCompleted && (
              <Badge className="flex items-center gap-2 text-lg px-4 py-2">
                <CheckCircle2 className="h-5 w-5" />
                Completed
              </Badge>
            )}
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="font-medium">
                Progress: {checkedCount}/{totalCount} items
              </span>
              <span className="text-muted-foreground">{progressPercent}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-3">
              <div 
                className="bg-primary rounded-full h-3 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {issuesCount > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-medium">
                {issuesCount} item{issuesCount > 1 ? 's have' : ' has'} issues
              </span>
            </div>
          )}
        </div>

        {/* Items Checklist */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Items to Receive</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {branchDispatch.items.map((item, index) => (
                <div 
                  key={item.id} 
                  className={`border rounded-lg p-4 ${
                    item.checked ? 'bg-green-50 border-green-200' : 
                    item.issue ? 'bg-red-50 border-red-200' : 
                    'bg-white'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-sm font-semibold">
                      {index + 1}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="font-semibold text-lg mb-1">{item.name}</div>
                          <div className="text-muted-foreground">
                            Ordered: {item.orderedQty} {item.unit}
                          </div>
                        </div>
                        
                        {!isCompleted && (
                          <div className="flex items-center gap-2">
                            <Checkbox
                              checked={item.checked}
                              onCheckedChange={(checked) => handleItemCheck(item.id, checked as boolean)}
                            />
                            <label className="text-sm font-medium cursor-pointer">Received</label>
                          </div>
                        )}
                        
                        {item.checked && (
                          <CheckCircle2 className="h-6 w-6 text-green-600" />
                        )}
                      </div>

                      {!isCompleted && (
                        <>
                          {/* Issue Buttons */}
                          <div className="flex flex-wrap gap-2 mb-3">
                            <Button
                              size="sm"
                              variant={item.issue === 'missing' ? "destructive" : "outline"}
                              onClick={() => handleIssue(item.id, item.issue === 'missing' ? null : 'missing')}
                            >
                              Missing
                            </Button>
                            <Button
                              size="sm"
                              variant={item.issue === 'damaged' ? "destructive" : "outline"}
                              onClick={() => handleIssue(item.id, item.issue === 'damaged' ? null : 'damaged')}
                            >
                              Damaged
                            </Button>
                            <Button
                              size="sm"
                              variant={item.issue === 'partial' ? "destructive" : "outline"}
                              onClick={() => handleIssue(item.id, item.issue === 'partial' ? null : 'partial')}
                            >
                              Partial
                            </Button>
                          </div>

                          {/* Partial Quantity Input */}
                          {item.issue === 'partial' && (
                            <div className="mb-3">
                              <label className="text-sm font-medium mb-1 block">
                                Received Quantity:
                              </label>
                              <div className="flex items-center gap-2">
                                <Input
                                  type="number"
                                  step="0.1"
                                  value={item.receivedQty || ''}
                                  onChange={(e) => handleReceivedQty(item.id, e.target.value)}
                                  className="w-32"
                                />
                                <span className="text-sm text-muted-foreground">{item.unit}</span>
                              </div>
                            </div>
                          )}

                          {/* Notes */}
                          <div>
                            <label className="text-sm font-medium mb-1 block">
                              Notes:
                            </label>
                            <Input
                              placeholder="Add any notes about this item..."
                              value={item.notes}
                              onChange={(e) => handleNotes(item.id, e.target.value)}
                            />
                          </div>
                        </>
                      )}

                      {/* Display issue info if completed */}
                      {isCompleted && item.issue && (
                        <div className="mt-2">
                          <Badge variant="destructive">
                            {item.issue.toUpperCase()}
                            {item.issue === 'partial' && item.receivedQty && 
                              ` - Received: ${item.receivedQty} ${item.unit}`
                            }
                          </Badge>
                          {item.notes && (
                            <div className="text-sm text-muted-foreground mt-1">
                              Note: {item.notes}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Overall Notes & Completion */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Overall Notes & Sign-off</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Overall Delivery Notes:
                </label>
                <textarea
                  className="w-full h-24 p-3 border rounded-lg"
                  placeholder="Any general notes about the delivery (timing, condition, driver info, etc.)"
                  value={overallNotes}
                  onChange={(e) => setOverallNotes(e.target.value)}
                  disabled={isCompleted}
                />
              </div>

              {!isCompleted && (
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Received By: *
                  </label>
                  <Input
                    placeholder="Enter your name"
                    value={receivedBy}
                    onChange={(e) => setReceivedBy(e.target.value)}
                  />
                </div>
              )}

              {isCompleted && (
                <div className="bg-muted p-4 rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">Received by:</div>
                  <div className="font-semibold">{branchDispatch.receivedBy}</div>
                  <div className="text-sm text-muted-foreground mt-2">
                    Completed: {branchDispatch.completedAt ? new Date(branchDispatch.completedAt).toLocaleString() : ''}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        {!isCompleted && (
          <div className="flex gap-3">
            <Button 
              onClick={saveProgress} 
              variant="outline"
              disabled={saving}
              className="flex-1"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Progress'}
            </Button>
            <Button 
              onClick={completeDispatch}
              disabled={saving}
              className="flex-1"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              {saving ? 'Completing...' : 'Complete & Sign Off'}
            </Button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}

