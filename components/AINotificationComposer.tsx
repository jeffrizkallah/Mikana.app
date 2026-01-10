'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Sparkles, X, Loader2, RefreshCw, Send, Wand2, AlertCircle } from 'lucide-react'
import { Notification, getNotificationTypeConfig } from '@/lib/notifications'

interface AINotificationComposerProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (notification: GeneratedNotification) => void
}

export interface GeneratedNotification {
  type: Notification['type']
  priority: Notification['priority']
  title: string
  preview: string
  content: string
  expires_in_days: number
  target_roles?: string[] | null
}

type Step = 'input' | 'loading' | 'preview'

export function AINotificationComposer({ isOpen, onClose, onSubmit }: AINotificationComposerProps) {
  const [step, setStep] = useState<Step>('input')
  const [prompt, setPrompt] = useState('')
  const [error, setError] = useState('')
  const [generatedNotification, setGeneratedNotification] = useState<GeneratedNotification | null>(null)
  
  // Editable fields in preview mode
  const [editedNotification, setEditedNotification] = useState<GeneratedNotification | null>(null)

  const resetState = () => {
    setStep('input')
    setPrompt('')
    setError('')
    setGeneratedNotification(null)
    setEditedNotification(null)
  }

  const handleClose = () => {
    resetState()
    onClose()
  }

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please describe what you want to announce')
      return
    }

    setError('')
    setStep('loading')

    try {
      const response = await fetch('/api/notifications/compose-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim() })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate notification')
      }

      if (data.success && data.notification) {
        setGeneratedNotification(data.notification)
        setEditedNotification(data.notification)
        setStep('preview')
      } else {
        throw new Error('Invalid response from AI')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setStep('input')
    }
  }

  const handleRegenerate = () => {
    setStep('input')
    setGeneratedNotification(null)
    setEditedNotification(null)
  }

  const handleSubmit = () => {
    if (editedNotification) {
      onSubmit(editedNotification)
      handleClose()
    }
  }

  const updateField = <K extends keyof GeneratedNotification>(
    field: K,
    value: GeneratedNotification[K]
  ) => {
    if (editedNotification) {
      setEditedNotification({ ...editedNotification, [field]: value })
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <Card className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <CardHeader className="border-b flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-sky-500 to-blue-600 rounded-lg">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span>AI Notification Composer</span>
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-6">
          {/* Step 1: Input */}
          {step === 'input' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Describe your notification
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => {
                    setPrompt(e.target.value)
                    if (error) setError('')
                  }}
                  placeholder="Example: Announce that Al Majaz branch will be closed for deep cleaning this Sunday from 6 AM to 12 PM. Mark it urgent and target kitchen staff and managers."
                  className="w-full min-h-[150px] rounded-lg border border-gray-300 dark:border-gray-600 bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500 focus:border-gray-400 dark:focus:border-gray-500 resize-none"
                  autoFocus
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Be specific about: what, when, where, who should see it, and if it&apos;s urgent
                </p>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleGenerate}
                  disabled={!prompt.trim()}
                  className="gap-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700"
                >
                  <Wand2 className="h-4 w-4" />
                  Generate Notification
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Loading */}
          {step === 'loading' && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-sky-400 to-blue-500 rounded-full blur-xl opacity-50 animate-pulse" />
                <div className="relative p-4 bg-gradient-to-br from-sky-500 to-blue-600 rounded-full">
                  <Loader2 className="h-8 w-8 text-white animate-spin" />
                </div>
              </div>
              <p className="mt-6 text-lg font-medium">Composing your notification...</p>
              <p className="text-sm text-muted-foreground mt-1">AI is crafting the perfect message</p>
            </div>
          )}

          {/* Step 3: Preview & Edit */}
          {step === 'preview' && editedNotification && (
            <div className="space-y-5">
              {/* Type & Priority Row */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Type</label>
                  <select
                    value={editedNotification.type}
                    onChange={(e) => updateField('type', e.target.value as Notification['type'])}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="feature">Feature Update</option>
                    <option value="patch">Patch Notes</option>
                    <option value="alert">Alert</option>
                    <option value="announcement">Announcement</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1.5">Priority</label>
                  <select
                    value={editedNotification.priority}
                    onChange={(e) => updateField('priority', e.target.value as Notification['priority'])}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="normal">Normal</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1.5">Expires In</label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={1}
                      max={30}
                      value={editedNotification.expires_in_days}
                      onChange={(e) => updateField('expires_in_days', parseInt(e.target.value) || 7)}
                      className="w-full"
                    />
                    <span className="text-sm text-muted-foreground whitespace-nowrap">days</span>
                  </div>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium mb-1.5">Title</label>
                <Input
                  value={editedNotification.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  placeholder="Notification title..."
                />
              </div>

              {/* Preview */}
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Preview <span className="text-muted-foreground font-normal">(shown in dropdown)</span>
                </label>
                <Input
                  value={editedNotification.preview}
                  onChange={(e) => updateField('preview', e.target.value)}
                  placeholder="Short preview text..."
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Content <span className="text-muted-foreground font-normal">(markdown supported)</span>
                </label>
                <textarea
                  value={editedNotification.content}
                  onChange={(e) => updateField('content', e.target.value)}
                  className="w-full min-h-[180px] rounded-md border border-input bg-background px-3 py-2 text-sm font-mono resize-none"
                />
              </div>

              {/* Target Roles Preview */}
              <div>
                <label className="block text-sm font-medium mb-1.5">Target Audience</label>
                <div className="flex flex-wrap gap-2">
                  {editedNotification.target_roles && editedNotification.target_roles.length > 0 ? (
                    editedNotification.target_roles.map(role => (
                      <Badge key={role} variant="secondary" className="capitalize">
                        {role}
                      </Badge>
                    ))
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground">
                      All users
                    </Badge>
                  )}
                </div>
              </div>

              {/* Preview Card */}
              <div className="border rounded-lg p-4 bg-muted/30">
                <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">Preview</p>
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-full ${getNotificationTypeConfig(editedNotification.type).bgLight}`}>
                    <Sparkles className={`h-4 w-4 ${getNotificationTypeConfig(editedNotification.type).textColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm">{editedNotification.title}</span>
                      <Badge variant="outline" className={`text-xs ${getNotificationTypeConfig(editedNotification.type).textColor}`}>
                        {getNotificationTypeConfig(editedNotification.type).label}
                      </Badge>
                      {editedNotification.priority === 'urgent' && (
                        <Badge variant="destructive" className="text-xs">Urgent</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {editedNotification.preview}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between gap-3 pt-4 border-t">
                <Button variant="outline" onClick={handleRegenerate} className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Regenerate
                </Button>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={handleClose}>
                    Cancel
                  </Button>
                  <Button onClick={handleSubmit} className="gap-2">
                    <Send className="h-4 w-4" />
                    Create Notification
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
