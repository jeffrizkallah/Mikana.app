'use client'

import { useEffect, useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import type { TourStep, TooltipPosition } from '@/lib/onboarding/types'

interface SpotlightTooltipProps {
  step: TourStep
  stepIndex: number
  totalSteps: number
  onNext: () => void
  onPrev: () => void
  onSkip: () => void
}

interface Position {
  top: number
  left: number
  placement: 'top' | 'bottom' | 'left' | 'right'
}

export function SpotlightTooltip({
  step,
  stepIndex,
  totalSteps,
  onNext,
  onPrev,
  onSkip
}: SpotlightTooltipProps) {
  const [position, setPosition] = useState<Position | null>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  
  const isFirst = stepIndex === 0
  const isLast = stepIndex === totalSteps - 1
  
  useEffect(() => {
    const calculatePosition = () => {
      const element = document.querySelector(step.targetSelector)
      const tooltip = tooltipRef.current
      
      if (!element || !tooltip) {
        // Fallback to center
        setPosition({
          top: window.innerHeight / 2,
          left: window.innerWidth / 2,
          placement: 'bottom'
        })
        return
      }
      
      const targetRect = element.getBoundingClientRect()
      const tooltipRect = tooltip.getBoundingClientRect()
      const padding = step.highlightPadding || 8
      const gap = 16 // Gap between spotlight and tooltip
      
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight
      
      let placement: 'top' | 'bottom' | 'left' | 'right' = step.position || 'auto' as any
      
      // Auto placement logic
      if (step.position === 'auto' || !step.position) {
        const spaceAbove = targetRect.top
        const spaceBelow = viewportHeight - targetRect.bottom
        const spaceLeft = targetRect.left
        const spaceRight = viewportWidth - targetRect.right
        
        // Prefer bottom, then top, then right, then left
        if (spaceBelow >= tooltipRect.height + gap + padding) {
          placement = 'bottom'
        } else if (spaceAbove >= tooltipRect.height + gap + padding) {
          placement = 'top'
        } else if (spaceRight >= tooltipRect.width + gap + padding) {
          placement = 'right'
        } else {
          placement = 'left'
        }
      }
      
      let top = 0
      let left = 0
      
      switch (placement) {
        case 'bottom':
          top = targetRect.bottom + padding + gap
          left = targetRect.left + targetRect.width / 2 - tooltipRect.width / 2
          break
        case 'top':
          top = targetRect.top - padding - gap - tooltipRect.height
          left = targetRect.left + targetRect.width / 2 - tooltipRect.width / 2
          break
        case 'right':
          top = targetRect.top + targetRect.height / 2 - tooltipRect.height / 2
          left = targetRect.right + padding + gap
          break
        case 'left':
          top = targetRect.top + targetRect.height / 2 - tooltipRect.height / 2
          left = targetRect.left - padding - gap - tooltipRect.width
          break
      }
      
      // Keep within viewport bounds
      left = Math.max(16, Math.min(left, viewportWidth - tooltipRect.width - 16))
      top = Math.max(16, Math.min(top, viewportHeight - tooltipRect.height - 16))
      
      setPosition({ top, left, placement })
    }
    
    // Initial calculation after a small delay for the element to render
    const timer = setTimeout(calculatePosition, 100)
    
    // Recalculate on resize
    window.addEventListener('resize', calculatePosition)
    
    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', calculatePosition)
    }
  }, [step])
  
  return (
    <div
      ref={tooltipRef}
      className={`
        fixed z-[95] w-[320px] max-w-[calc(100vw-32px)]
        bg-white dark:bg-slate-900 rounded-xl shadow-2xl
        border border-border
        animate-in fade-in slide-in-from-bottom-2 duration-300
        ${position ? '' : 'opacity-0'}
      `}
      style={{
        top: position?.top || 0,
        left: position?.left || 0
      }}
    >
      {/* Arrow indicator based on placement - could add later */}
      
      {/* Close button */}
      <button
        onClick={onSkip}
        className="absolute top-3 right-3 p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        aria-label="Skip tour"
      >
        <X className="h-4 w-4" />
      </button>
      
      {/* Content */}
      <div className="p-5">
        <h3 className="text-lg font-semibold mb-2 pr-6">{step.title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {step.description}
        </p>
      </div>
      
      {/* Footer */}
      <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-border rounded-b-xl flex items-center justify-between">
        {/* Progress dots */}
        <div className="flex items-center gap-1.5">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`
                w-2 h-2 rounded-full transition-all duration-200
                ${i === stepIndex 
                  ? 'bg-primary w-4' 
                  : i < stepIndex 
                    ? 'bg-primary/50' 
                    : 'bg-border'
                }
              `}
            />
          ))}
          <span className="ml-2 text-xs text-muted-foreground">
            {stepIndex + 1}/{totalSteps}
          </span>
        </div>
        
        {/* Navigation buttons */}
        <div className="flex items-center gap-2">
          {!isFirst && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onPrev}
              className="h-8 px-2"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
          
          <Button
            size="sm"
            onClick={onNext}
            className="h-8"
          >
            {isLast ? (
              'Got it!'
            ) : (
              <>
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

