'use client'

import { useState } from 'react'
import { Clock, ChevronDown, ChevronUp, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { DailyFlow, DailyFlowItem } from '@/lib/data'

interface DailyTimelineProps {
  dailyFlow: DailyFlow
}

interface TimelineSectionProps {
  title: string
  items: DailyFlowItem[]
  icon?: React.ReactNode
}

function TimelineSection({ title, items, icon }: TimelineSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  if (items.length === 0) return null

  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 bg-muted/50 flex items-center justify-between hover:bg-muted transition-colors"
      >
        <div className="flex items-center gap-2">
          {icon}
          <span className="font-semibold">{title}</span>
          <span className="text-sm text-muted-foreground">({items.length} items)</span>
        </div>
        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      {isExpanded && (
        <div className="p-4 space-y-3">
          {items.map((item, index) => (
            <div
              key={index}
              className="flex gap-4 pb-3 border-b last:border-b-0 last:pb-0"
            >
              <div className="flex-shrink-0 w-24">
                <div className="flex items-center gap-1 text-sm font-medium text-primary">
                  <Clock className="h-3 w-3" />
                  {item.time}
                </div>
              </div>
              <div className="flex-1 space-y-1">
                <div className="font-medium">{item.action}</div>
                <div className="text-sm text-muted-foreground">Owner: {item.owner}</div>
                {item.hint && (
                  <div className="flex items-start gap-1 text-sm text-muted-foreground mt-2 p-2 bg-muted/50 rounded">
                    <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>{item.hint}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function DailyTimeline({ dailyFlow }: DailyTimelineProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Daily Timeline</h3>
      
      <TimelineSection
        title="Morning"
        items={dailyFlow.morning}
        icon={<Clock className="h-4 w-4" />}
      />
      
      <TimelineSection
        title="Pre-Lunch"
        items={dailyFlow.preLunch}
        icon={<Clock className="h-4 w-4" />}
      />
      
      <TimelineSection
        title="Service"
        items={dailyFlow.service}
        icon={<Clock className="h-4 w-4" />}
      />
      
      <TimelineSection
        title="Post-Lunch"
        items={dailyFlow.postLunch}
        icon={<Clock className="h-4 w-4" />}
      />
      
      <TimelineSection
        title="Closeout"
        items={dailyFlow.closeout}
        icon={<Clock className="h-4 w-4" />}
      />
    </div>
  )
}

