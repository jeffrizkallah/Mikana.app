'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { RoleSidebar } from '@/components/RoleSidebar'
import { Footer } from '@/components/Footer'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Upload, Package, Clock, CheckCircle2, AlertTriangle, Trash2, FileText, Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import type { Dispatch } from '@/lib/data'

export default function DispatchDashboardPage() {
  const router = useRouter()
  const { user, loading: authLoading, canEdit } = useAuth({ 
    required: true, 
    allowedRoles: ['admin', 'operations_lead', 'dispatcher'] 
  })
  const [dispatches, setDispatches] = useState<Dispatch[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedDispatch, setSelectedDispatch] = useState<Dispatch | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    fetchDispatches()
  }, [])

  const fetchDispatches = async () => {
    try {
      const response = await fetch('/api/dispatch')
      const data = await response.json()
      setDispatches(data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching dispatches:', error)
      setLoading(false)
    }
  }

  const handleDeleteClick = (dispatch: Dispatch) => {
    setSelectedDispatch(dispatch)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedDispatch) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/dispatch/${selectedDispatch.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        // Refresh the page
        setDeleteDialogOpen(false)
        setSelectedDispatch(null)
        fetchDispatches()
        // Show success message
        alert('✓ Dispatch deleted and archived successfully!')
      } else {
        throw new Error('Failed to delete dispatch')
      }
    } catch (error) {
      console.error('Error deleting dispatch:', error)
      alert('Error deleting dispatch. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  // Calculate stats from dispatches
  const stats = {
    total: dispatches.length,
    pending: dispatches.filter(d => 
      d.branchDispatches.some(bd => bd.status === 'pending' || bd.status === 'packing')
    ).length,
    dispatched: dispatches.filter(d => 
      d.branchDispatches.some(bd => bd.status === 'dispatched' || bd.status === 'receiving')
    ).length,
    completed: dispatches.filter(d => 
      d.branchDispatches.every(bd => bd.status === 'completed')
    ).length,
    withIssues: dispatches.filter(d => 
      d.branchDispatches.some(bd => bd.items?.some((item: any) => item.issue !== null))
    ).length
  }
  
  // Sort by date, most recent first
  const sortedDispatches = [...dispatches].sort((a, b) => 
    new Date(b.deliveryDate).getTime() - new Date(a.deliveryDate).getTime()
  )

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any, icon: any, label: string, color?: string }> = {
      pending: { variant: 'secondary', icon: Clock, label: 'Pending' },
      packing: { variant: 'default', icon: Package, label: 'Packing', color: 'bg-blue-600' },
      dispatched: { variant: 'default', icon: Package, label: 'Dispatched', color: 'bg-orange-600' },
      receiving: { variant: 'default', icon: Package, label: 'Receiving', color: 'bg-orange-600' },
      completed: { variant: 'default', icon: CheckCircle2, label: 'Completed', color: 'bg-green-600' },
    }
    const config = variants[status] || variants.pending
    const Icon = config.icon
    return (
      <Badge variant={config.variant} className={`flex items-center gap-1 ${config.color || ''}`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric',
      month: 'short', 
      day: 'numeric' 
    })
  }

  // Show loading while auth is checking
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  const canModify = canEdit('dispatch')

  return (
    <>
      <div className="flex min-h-screen">
        <RoleSidebar />
      
        <main className="flex-1 flex flex-col pt-16 md:pt-0">
          <div className="flex-1 container mx-auto px-4 py-8">
            <Breadcrumbs
              items={[
                { label: 'Home', href: '/' },
                { label: 'Dispatch' },
              ]}
            />

            <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">Dispatch Management</h1>
              <p className="text-muted-foreground">Monitor and manage all branch dispatches</p>
            </div>
            <Link href="/dispatch/upload" data-tour-id="create-dispatch-btn">
              <Button size="lg" className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Create Dispatch
              </Button>
            </Link>
            </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold">{stats.total}</div>
                <div className="text-sm text-muted-foreground mt-1">Total Dispatches</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
                <div className="text-sm text-muted-foreground mt-1">Pending</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{stats.dispatched}</div>
                <div className="text-sm text-muted-foreground mt-1">Dispatched</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{stats.completed}</div>
                <div className="text-sm text-muted-foreground mt-1">Completed</div>
              </div>
            </CardContent>
          </Card>
          
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-600">{stats.withIssues}</div>
                    <div className="text-sm text-muted-foreground mt-1">With Issues</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Dispatch List */}
            <Card data-tour-id="dispatch-list">
          <CardHeader>
            <CardTitle>All Dispatches</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50 animate-pulse" />
                <p className="text-muted-foreground">Loading dispatches...</p>
              </div>
            ) : dispatches.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No dispatches yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first dispatch to get started
                </p>
                <Link href="/dispatch/upload">
                  <Button>
                    <Upload className="h-4 w-4 mr-2" />
                    Create First Dispatch
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {sortedDispatches.map(dispatch => {
                  const totalBranches = dispatch.branchDispatches.length
                  const completedBranches = dispatch.branchDispatches.filter(
                    bd => bd.status === 'completed'
                  ).length
                  const pendingBranches = dispatch.branchDispatches.filter(
                    bd => bd.status === 'pending' || bd.status === 'packing'
                  ).length
                  const dispatchedBranches = dispatch.branchDispatches.filter(
                    bd => bd.status === 'dispatched' || bd.status === 'receiving'
                  ).length
                  const withIssues = dispatch.branchDispatches.filter(
                    bd => bd.items?.some((item: any) => item.issue !== null)
                  ).length

                  return (
                    <div key={dispatch.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg">
                              Delivery: {formatDate(dispatch.deliveryDate)}
                            </h3>
                            {withIssues > 0 && (
                              <Link href={`/dispatch/${dispatch.id}/report`}>
                                <Badge variant="destructive" className="flex items-center gap-1 cursor-pointer hover:bg-destructive/80 transition-colors">
                                  <AlertTriangle className="h-3 w-3" />
                                  {withIssues} Issue{withIssues > 1 ? 's' : ''}
                                </Badge>
                              </Link>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Created: {formatDate(dispatch.createdDate)} by {dispatch.createdBy}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Link href={`/dispatch/${dispatch.id}/report`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-2"
                            >
                              <FileText className="h-4 w-4" />
                              View Report
                            </Button>
                          </Link>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteClick(dispatch)}
                            className="flex items-center gap-2"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <div className="text-sm text-muted-foreground">Total Branches</div>
                          <div className="text-xl font-semibold">{totalBranches}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Completed</div>
                          <div className="text-xl font-semibold text-green-600">{completedBranches}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Dispatched</div>
                          <div className="text-xl font-semibold text-blue-600">{dispatchedBranches}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Packing</div>
                          <div className="text-xl font-semibold text-yellow-600">{pendingBranches}</div>
                        </div>
                      </div>

                      <div className="border-t pt-3 mt-3">
                        <details>
                          <summary className="cursor-pointer text-sm font-medium text-primary hover:underline">
                            View branch details ({totalBranches} branches)
                          </summary>
                          <div className="mt-3 space-y-2">
                            {dispatch.branchDispatches.map(bd => {
                              const issueItems = bd.items.filter((item: any) => item.issue !== null)
                              return (
                                <div key={bd.branchSlug} className="flex items-center justify-between p-2 bg-muted rounded">
                                  <div className="flex-1">
                                    <div className="font-medium">{bd.branchName}</div>
                                    <div className="text-sm text-muted-foreground">
                                      {bd.items.length} items
                                      {issueItems.length > 0 && (
                                        <span className="text-red-600 ml-2">
                                          • {issueItems.length} issue{issueItems.length > 1 ? 's' : ''}
                                        </span>
                                      )}
                                      {bd.packedBy && (
                                        <span className="ml-2">• Packed by {bd.packedBy}</span>
                                      )}
                                      {bd.receivedBy && (
                                        <span className="ml-2">• Received by {bd.receivedBy}</span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {getStatusBadge(bd.status)}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </details>
                      </div>
                    </div>
                  )
                })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Footer />
        </main>
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        dispatchDate={selectedDispatch ? formatDate(selectedDispatch.deliveryDate) : ''}
        branchCount={selectedDispatch?.branchDispatches.length || 0}
        isDeleting={isDeleting}
      />
    </>
  )
}

