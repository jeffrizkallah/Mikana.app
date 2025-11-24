'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Package, Clock, CheckCircle2, AlertTriangle, ChevronRight } from 'lucide-react'
import type { Dispatch, BranchDispatch } from '@/lib/data'

interface BranchDispatchesProps {
  branchSlug: string
}

export function BranchDispatches({ branchSlug }: BranchDispatchesProps) {
  const [dispatches, setDispatches] = useState<Array<Dispatch & { branchDispatch: BranchDispatch }>>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'pending' | 'dispatched' | 'completed'>('pending')

  useEffect(() => {
    fetchDispatches()
  }, [branchSlug])

  const fetchDispatches = async () => {
    try {
      const response = await fetch('/api/dispatch')
      const allDispatches: Dispatch[] = await response.json()
      
      // Filter dispatches for this branch
      const branchDispatches = allDispatches
        .map(dispatch => {
          const branchDispatch = dispatch.branchDispatches.find(
            bd => bd.branchSlug === branchSlug
          )
          if (branchDispatch) {
            return {
              ...dispatch,
              branchDispatch
            }
          }
          return null
        })
        .filter(d => d !== null) as Array<Dispatch & { branchDispatch: BranchDispatch }>
      
      // Sort by delivery date, most recent first
      branchDispatches.sort((a, b) => 
        new Date(b.deliveryDate).getTime() - new Date(a.deliveryDate).getTime()
      )
      
      setDispatches(branchDispatches)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching dispatches:', error)
      setLoading(false)
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })
  }

  const pendingDispatches = dispatches.filter(
    d => d.branchDispatch.status === 'pending' || d.branchDispatch.status === 'packing'
  )
  
  const dispatchedDispatches = dispatches.filter(
    d => d.branchDispatch.status === 'dispatched' || d.branchDispatch.status === 'receiving'
  )
  
  const completedDispatches = dispatches.filter(
    d => d.branchDispatch.status === 'completed'
  )

  const currentDispatches = activeTab === 'pending' 
    ? pendingDispatches 
    : activeTab === 'dispatched'
    ? dispatchedDispatches
    : completedDispatches

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Dispatches & Deliveries
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Loading dispatches...
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Dispatches & Deliveries
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <Button
            variant={activeTab === 'pending' ? "default" : "outline"}
            onClick={() => setActiveTab('pending')}
            className="flex-1"
          >
            <Clock className="h-4 w-4 mr-2" />
            Pending ({pendingDispatches.length})
          </Button>
          <Button
            variant={activeTab === 'dispatched' ? "default" : "outline"}
            onClick={() => setActiveTab('dispatched')}
            className="flex-1"
          >
            <Package className="h-4 w-4 mr-2" />
            Dispatched ({dispatchedDispatches.length})
          </Button>
          <Button
            variant={activeTab === 'completed' ? "default" : "outline"}
            onClick={() => setActiveTab('completed')}
            className="flex-1"
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Done ({completedDispatches.length})
          </Button>
        </div>

        {/* Dispatch List */}
        <div className="space-y-3">
          {currentDispatches.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <div>
                {activeTab === 'pending' 
                  ? 'No pending dispatches' 
                  : activeTab === 'dispatched'
                  ? 'No dispatched items to receive'
                  : 'No completed dispatches yet'
                }
              </div>
            </div>
          ) : (
            currentDispatches.map(dispatch => {
              const bd = dispatch.branchDispatch
              const issuesCount = bd.items.filter(item => item.issue !== null).length
              const isCompleted = bd.status === 'completed'
              const isPacking = bd.status === 'packing'
              const isDispatched = bd.status === 'dispatched'
              const isReceiving = bd.status === 'receiving'
              
              // Get button text based on status
              let buttonText = 'Open Checklist'
              let buttonIcon = Package
              if (bd.status === 'pending') {
                buttonText = 'Start Packing'
                buttonIcon = Package
              } else if (isPacking) {
                buttonText = 'Continue Packing'
                buttonIcon = Package
              } else if (isDispatched) {
                buttonText = 'Start Receiving'
                buttonIcon = Package
              } else if (isReceiving) {
                buttonText = 'Continue Receiving'
                buttonIcon = Package
              } else if (isCompleted) {
                buttonText = 'View Details'
                buttonIcon = ChevronRight
              }
              
              const ButtonIcon = buttonIcon
              
              return (
                <div 
                  key={dispatch.id} 
                  className={`border rounded-lg p-4 ${
                    isCompleted ? 'border-l-4 border-l-green-500' :
                    isDispatched || isReceiving ? 'border-l-4 border-l-orange-500' :
                    'border-l-4 border-l-blue-500'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {bd.status === 'pending' && (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            📋 Ready to Pack
                          </Badge>
                        )}
                        {isPacking && (
                          <Badge variant="default" className="flex items-center gap-1 bg-blue-600">
                            🔄 Packing
                          </Badge>
                        )}
                        {(isDispatched || isReceiving) && (
                          <Badge variant="secondary" className="flex items-center gap-1 bg-orange-600 text-white">
                            📦 Ready to Receive
                          </Badge>
                        )}
                        {issuesCount > 0 && (
                          <Badge variant="destructive" className="flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            {issuesCount} Issue{issuesCount > 1 ? 's' : ''}
                          </Badge>
                        )}
                      </div>
                      <div className="font-semibold text-lg">
                        Delivery: {formatDate(dispatch.deliveryDate)}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {bd.items.length} items
                        {bd.packedBy && ` • Packed by ${bd.packedBy}`}
                        {bd.receivedBy && ` • Received by ${bd.receivedBy}`}
                      </div>
                    </div>
                  </div>

                  {/* Progress for packing/receiving */}
                  {!isCompleted && (
                    <div className="mb-3">
                      <div className="text-xs text-muted-foreground mb-1">
                        {isPacking || bd.status === 'pending' ? (
                          <>{bd.items.filter(item => item.packedChecked).length}/{bd.items.length} items packed</>
                        ) : (
                          <>{bd.items.filter(item => item.receivedChecked).length}/{bd.items.length} items received</>
                        )}
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary rounded-full h-2 transition-all"
                          style={{ 
                            width: `${isPacking || bd.status === 'pending' 
                              ? (bd.items.filter(item => item.packedChecked).length / bd.items.length) * 100
                              : (bd.items.filter(item => item.receivedChecked).length / bd.items.length) * 100
                            }%` 
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  <Link href={`/dispatch/${dispatch.id}/branch/${branchSlug}`}>
                    <Button 
                      className="w-full"
                      variant={isCompleted ? "outline" : "default"}
                    >
                      <ButtonIcon className="h-4 w-4 mr-2" />
                      {buttonText}
                    </Button>
                  </Link>
                </div>
              )
            })
          )}
        </div>
      </CardContent>
    </Card>
  )
}

