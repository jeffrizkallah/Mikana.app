'use client'

import { useRef, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles, CheckCircle, AlertTriangle, Info, AlertCircle, ChevronDown, X, UserPlus, ClipboardCheck } from 'lucide-react'
import { Notification, formatRelativeTime, getNotificationTypeConfig } from '@/lib/notifications'
import { Button } from '@/components/ui/button'

interface NotificationItemProps {
  notification: Notification
  isExpanded: boolean
  onToggle: () => void
  onMarkAsRead: (id: string) => void
}

const typeIcons = {
  feature: Sparkles,
  patch: CheckCircle,
  alert: AlertTriangle,
  announcement: Info,
  urgent: AlertCircle,
  user_signup: UserPlus,
}

// Simple markdown-like renderer for notification content
function renderContent(content: string) {
  const lines = content.split('\n')
  const elements: JSX.Element[] = []
  let listItems: string[] = []
  let inList = false

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`list-${elements.length}`} className="list-disc list-inside space-y-1 mb-3 text-xs">
          {listItems.map((item, i) => (
            <li key={i} dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(item) }} />
          ))}
        </ul>
      )
      listItems = []
    }
    inList = false
  }

  const formatInlineMarkdown = (text: string) => {
    return text
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code class="px-1 py-0.5 bg-muted rounded text-[10px]">$1</code>')
  }

  lines.forEach((line, index) => {
    const trimmed = line.trim()

    // Heading 2
    if (trimmed.startsWith('## ')) {
      flushList()
      elements.push(
        <h2 key={index} className="text-sm font-bold mb-2 mt-3 first:mt-0 text-foreground">
          {trimmed.replace('## ', '')}
        </h2>
      )
      return
    }

    // Heading 3
    if (trimmed.startsWith('### ')) {
      flushList()
      const heading = trimmed.replace('### ', '')
      let headingColor = 'text-foreground'
      if (heading.toLowerCase().includes('added')) headingColor = 'text-green-600'
      if (heading.toLowerCase().includes('changed')) headingColor = 'text-amber-600'
      if (heading.toLowerCase().includes('deleted') || heading.toLowerCase().includes('removed')) headingColor = 'text-red-600'
      if (heading.toLowerCase().includes('fixed')) headingColor = 'text-blue-600'
      
      elements.push(
        <h3 key={index} className={`text-xs font-semibold mb-1.5 mt-2 ${headingColor}`}>
          {heading}
        </h3>
      )
      return
    }

    // List item
    if (trimmed.startsWith('- ')) {
      inList = true
      listItems.push(trimmed.replace('- ', ''))
      return
    }

    // Empty line
    if (!trimmed) {
      flushList()
      return
    }

    // Regular paragraph
    flushList()
    elements.push(
      <p 
        key={index} 
        className="text-xs text-muted-foreground mb-2"
        dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(trimmed) }}
      />
    )
  })

  flushList()
  return elements
}

export function NotificationItem({ notification, isExpanded, onToggle, onMarkAsRead }: NotificationItemProps) {
  const router = useRouter()
  const config = getNotificationTypeConfig(notification.type)
  const Icon = typeIcons[notification.type] || Info
  const isUnread = !notification.is_read
  const contentRef = useRef<HTMLDivElement>(null)
  const [contentHeight, setContentHeight] = useState(0)
  
  // Check if this is a quality feedback notification
  const metadata = notification.metadata as { qualityCheckId?: number; branchSlug?: string } | null
  const isQualityFeedback = metadata?.qualityCheckId !== undefined

  // Measure content height for smooth animation
  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight)
    }
  }, [notification.content, isExpanded])

  // Mark as read when expanded
  useEffect(() => {
    if (isExpanded && isUnread) {
      onMarkAsRead(notification.id)
    }
  }, [isExpanded, isUnread, notification.id, onMarkAsRead])

  return (
    <div
      className={`
        border-l-4 transition-colors duration-200
        ${config.borderColor}
        ${isUnread ? 'bg-accent/30' : 'bg-transparent'}
        ${notification.priority === 'urgent' && !isExpanded ? 'animate-pulse-subtle' : ''}
      `}
    >
      {/* Clickable Header */}
      <button
        onClick={onToggle}
        className={`
          w-full text-left p-4 transition-all duration-200
          hover:bg-accent/50
          ${isExpanded ? 'bg-accent/40' : ''}
        `}
      >
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className={`p-2 rounded-full ${config.bgLight} flex-shrink-0`}>
            <Icon className={`h-4 w-4 ${config.textColor}`} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`font-semibold text-sm ${isUnread ? 'text-foreground' : 'text-muted-foreground'}`}>
                {notification.title}
              </span>
              {isUnread && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase bg-primary text-primary-foreground rounded">
                  New
                </span>
              )}
              {notification.priority === 'urgent' && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase bg-red-500 text-white rounded">
                  Urgent
                </span>
              )}
            </div>
            {!isExpanded && (
              <p className="text-xs text-muted-foreground line-clamp-2 mb-1">
                {notification.preview}
              </p>
            )}
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground">
                {formatRelativeTime(notification.created_at)}
              </span>
            </div>
          </div>

          {/* Expand/Collapse Icon */}
          <ChevronDown 
            className={`
              h-4 w-4 text-muted-foreground flex-shrink-0 
              transition-transform duration-300 ease-out
              ${isExpanded ? 'rotate-180' : ''}
            `} 
          />
        </div>
      </button>

      {/* Expandable Content */}
      <div
        className="overflow-hidden transition-all duration-300 ease-out"
        style={{ 
          maxHeight: isExpanded ? `${contentHeight}px` : '0px',
          opacity: isExpanded ? 1 : 0,
        }}
      >
        <div ref={contentRef} className="px-4 pb-4 pt-0">
          {/* Type Badge */}
          <div className="flex items-center gap-2 mb-3 pl-11">
            <span className={`px-2 py-0.5 text-[10px] font-medium rounded ${config.bgLight} ${config.textColor}`}>
              {config.label}
            </span>
          </div>

          {/* Full Content */}
          <div className="pl-11 border-l-2 border-border ml-4">
            <div className="pl-4">
              {renderContent(notification.content)}
            </div>
          </div>

          {/* Action Button for user_signup notifications */}
          {notification.type === 'user_signup' && (
            <div className="mt-4 pl-11">
              <a
                href="/admin/users"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground text-xs font-medium rounded-md hover:bg-primary/90 transition-colors"
              >
                <UserPlus className="h-3.5 w-3.5" />
                Review in Admin Panel
              </a>
            </div>
          )}

          {/* Action Button for quality feedback notifications */}
          {isQualityFeedback && (
            <div className="mt-4 pl-11">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  // Navigate to the branch quality check page with a query param to open the modal
                  const branchSlug = metadata?.branchSlug || ''
                  router.push(`/branch/${branchSlug}/quality-check?viewCheck=${metadata?.qualityCheckId}`)
                }}
                className="inline-flex items-center gap-2 px-3 py-2 bg-orange-500 text-white text-xs font-medium rounded-md hover:bg-orange-600 transition-colors"
              >
                <ClipboardCheck className="h-3.5 w-3.5" />
                View Quality Check & Acknowledge
              </button>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between mt-4 pl-11 pt-3 border-t border-border">
            <span className="text-[10px] text-muted-foreground">
              Posted by {notification.created_by}
            </span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={(e) => {
                e.stopPropagation()
                onToggle()
              }}
              className="h-7 text-xs"
            >
              <X className="h-3 w-3 mr-1" />
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
