'use client'

import { useEffect, useState } from 'react'
import { X, AlertTriangle, Thermometer, Scale, CheckCircle, XCircle, Clock, User, MapPin, Calendar, Image as ImageIcon, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'

interface QualityCheckDetail {
  id: number
  branchSlug: string
  branchName: string
  submittedBy: string
  submitterName: string
  submitterEmail?: string
  submissionDate: string
  mealService: string
  productName: string
  section: string
  tasteScore: number
  appearanceScore: number
  portionQtyGm?: number
  tempCelsius?: number
  tasteNotes?: string
  portionNotes?: string
  appearanceNotes?: string
  remarks?: string
  correctiveActionTaken?: boolean
  correctiveActionNotes?: string
  photos?: string[]
  status: string
  adminNotes?: string
  reviewedBy?: string
  reviewedAt?: string
  createdAt: string
}

interface QualityCheckDetailModalProps {
  submissionId: number | null
  onClose: () => void
}

export function QualityCheckDetailModal({ submissionId, onClose }: QualityCheckDetailModalProps) {
  const [submission, setSubmission] = useState<QualityCheckDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null)

  useEffect(() => {
    if (!submissionId) {
      setSubmission(null)
      return
    }

    const fetchSubmission = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(`/api/quality-checks/${submissionId}`)
        if (!response.ok) {
          throw new Error('Failed to fetch submission details')
        }
        const data = await response.json()
        setSubmission(data)
      } catch (err) {
        console.error('Error fetching submission:', err)
        setError('Failed to load submission details')
      } finally {
        setLoading(false)
      }
    }

    fetchSubmission()
  }, [submissionId])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  if (!submissionId) return null

  const getScoreColor = (score: number) => {
    if (score <= 2) return 'text-red-600 bg-red-100 border-red-300'
    if (score <= 3) return 'text-amber-600 bg-amber-100 border-amber-300'
    if (score <= 4) return 'text-yellow-600 bg-yellow-100 border-yellow-300'
    return 'text-green-600 bg-green-100 border-green-300'
  }

  const getScoreLabel = (score: number) => {
    if (score === 1) return 'Very Poor'
    if (score === 2) return 'Poor'
    if (score === 3) return 'Fair'
    if (score === 4) return 'Good'
    if (score === 5) return 'Excellent'
    return 'N/A'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatMealService = (service: string) => {
    return service.charAt(0).toUpperCase() + service.slice(1)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <Card className="relative w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-border bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-xs">
                  #{submissionId}
                </Badge>
                {submission && (
                  <Badge className="text-xs bg-blue-600">
                    {formatMealService(submission.mealService)}
                  </Badge>
                )}
              </div>
              {submission && (
                <>
                  <h2 className="font-bold text-xl text-foreground mb-1">
                    {submission.productName}
                  </h2>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {submission.branchName}
                    </span>
                    <span className="flex items-center gap-1">
                      <Badge variant="secondary" className="text-xs">
                        {submission.section}
                      </Badge>
                    </span>
                  </div>
                </>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="flex-shrink-0"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading details...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {submission && !loading && !error && (
            <div className="space-y-6">
              {/* Scores Section */}
              <div>
                <h3 className="font-semibold text-sm mb-3 text-muted-foreground uppercase tracking-wide">
                  Quality Scores
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className={`p-4 rounded-lg border-2 ${getScoreColor(submission.tasteScore)}`}>
                    <p className="text-xs font-medium mb-1 opacity-75">Taste</p>
                    <p className="text-3xl font-bold">{submission.tasteScore}/5</p>
                    <p className="text-xs mt-1">{getScoreLabel(submission.tasteScore)}</p>
                  </div>
                  <div className={`p-4 rounded-lg border-2 ${getScoreColor(submission.appearanceScore)}`}>
                    <p className="text-xs font-medium mb-1 opacity-75">Appearance</p>
                    <p className="text-3xl font-bold">{submission.appearanceScore}/5</p>
                    <p className="text-xs mt-1">{getScoreLabel(submission.appearanceScore)}</p>
                  </div>
                </div>
              </div>

              {/* Measurements Section */}
              {(submission.tempCelsius !== null || submission.portionQtyGm !== null) && (
                <div>
                  <h3 className="font-semibold text-sm mb-3 text-muted-foreground uppercase tracking-wide">
                    Measurements
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {submission.tempCelsius !== null && (
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Thermometer className="h-4 w-4 text-blue-600" />
                          <p className="text-xs font-medium text-blue-900">Temperature</p>
                        </div>
                        <p className="text-2xl font-bold text-blue-700">{submission.tempCelsius}°C</p>
                      </div>
                    )}
                    {submission.portionQtyGm !== null && (
                      <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Scale className="h-4 w-4 text-purple-600" />
                          <p className="text-xs font-medium text-purple-900">Portion Weight</p>
                        </div>
                        <p className="text-2xl font-bold text-purple-700">{submission.portionQtyGm}g</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Notes Section */}
              {(submission.tasteNotes || submission.appearanceNotes || submission.portionNotes) && (
                <div>
                  <h3 className="font-semibold text-sm mb-3 text-muted-foreground uppercase tracking-wide">
                    Detailed Notes
                  </h3>
                  <div className="space-y-3">
                    {submission.tasteNotes && (
                      <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                        <p className="text-xs font-medium text-amber-900 mb-1">Taste Notes</p>
                        <p className="text-sm text-amber-800">{submission.tasteNotes}</p>
                      </div>
                    )}
                    {submission.appearanceNotes && (
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-xs font-medium text-blue-900 mb-1">Appearance Notes</p>
                        <p className="text-sm text-blue-800">{submission.appearanceNotes}</p>
                      </div>
                    )}
                    {submission.portionNotes && (
                      <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                        <p className="text-xs font-medium text-purple-900 mb-1">Portion Notes</p>
                        <p className="text-sm text-purple-800">{submission.portionNotes}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Remarks */}
              {submission.remarks && (
                <div>
                  <h3 className="font-semibold text-sm mb-3 text-muted-foreground uppercase tracking-wide">
                    Additional Remarks
                  </h3>
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="text-sm text-slate-700">{submission.remarks}</p>
                  </div>
                </div>
              )}

              {/* Corrective Action */}
              {submission.correctiveActionTaken && (
                <div>
                  <h3 className="font-semibold text-sm mb-3 text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Corrective Action Taken
                  </h3>
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm text-green-800">
                      {submission.correctiveActionNotes || 'Corrective action was taken for this submission.'}
                    </p>
                  </div>
                </div>
              )}

              {/* Photos */}
              {submission.photos && submission.photos.length > 0 && (
                <div>
                  <h3 className="font-semibold text-sm mb-3 text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    Photos ({submission.photos.length})
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    {submission.photos.map((photo, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedPhoto(photo)}
                        className="relative aspect-square rounded-lg overflow-hidden border hover:ring-2 hover:ring-primary transition-all group"
                      >
                        <Image
                          src={photo}
                          alt={`Photo ${index + 1}`}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                          <Eye className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Submission Info */}
              <div className="pt-4 border-t border-border">
                <h3 className="font-semibold text-sm mb-3 text-muted-foreground uppercase tracking-wide">
                  Submission Information
                </h3>
                <div className="grid gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Submitted by:</span>
                    <span className="font-medium">{submission.submitterName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Date:</span>
                    <span className="font-medium">{formatDate(submission.submissionDate)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Status:</span>
                    <Badge variant={submission.status === 'completed' ? 'default' : 'secondary'}>
                      {submission.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-border bg-muted/30">
          <div className="flex items-center justify-end gap-2">
            <Button onClick={onClose} variant="default">
              Close
            </Button>
          </div>
        </div>
      </Card>

      {/* Photo Lightbox */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-[110] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white hover:bg-white/20"
            onClick={() => setSelectedPhoto(null)}
          >
            <X className="h-6 w-6" />
          </Button>
          <div className="relative max-w-5xl w-full aspect-video">
            <Image
              src={selectedPhoto}
              alt="Full size photo"
              fill
              className="object-contain"
            />
          </div>
        </div>
      )}
    </div>
  )
}

