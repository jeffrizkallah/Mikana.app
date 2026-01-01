'use client'

import { useEffect, useState, useRef } from 'react'

interface SpotlightOverlayProps {
  targetSelector: string
  padding?: number
  onClickOutside?: () => void
}

interface TargetRect {
  top: number
  left: number
  width: number
  height: number
}

export function SpotlightOverlay({ 
  targetSelector, 
  padding = 8,
  onClickOutside 
}: SpotlightOverlayProps) {
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null)
  const overlayRef = useRef<SVGSVGElement>(null)
  
  useEffect(() => {
    const updateTargetRect = () => {
      const element = document.querySelector(targetSelector)
      if (element) {
        const rect = element.getBoundingClientRect()
        setTargetRect({
          top: rect.top - padding,
          left: rect.left - padding,
          width: rect.width + padding * 2,
          height: rect.height + padding * 2
        })
        
        // Scroll element into view if needed
        const isInViewport = 
          rect.top >= 0 &&
          rect.left >= 0 &&
          rect.bottom <= window.innerHeight &&
          rect.right <= window.innerWidth
          
        if (!isInViewport) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' })
          // Update rect after scroll
          setTimeout(updateTargetRect, 300)
        }
      } else {
        setTargetRect(null)
      }
    }
    
    // Initial calculation
    updateTargetRect()
    
    // Recalculate on resize and scroll
    window.addEventListener('resize', updateTargetRect)
    window.addEventListener('scroll', updateTargetRect, true)
    
    // Use MutationObserver for dynamic content
    const observer = new MutationObserver(updateTargetRect)
    observer.observe(document.body, { childList: true, subtree: true })
    
    return () => {
      window.removeEventListener('resize', updateTargetRect)
      window.removeEventListener('scroll', updateTargetRect, true)
      observer.disconnect()
    }
  }, [targetSelector, padding])
  
  const handleOverlayClick = (e: React.MouseEvent) => {
    // Check if click is outside the spotlight area
    if (targetRect && onClickOutside) {
      const x = e.clientX
      const y = e.clientY
      
      const isInsideSpotlight = 
        x >= targetRect.left &&
        x <= targetRect.left + targetRect.width &&
        y >= targetRect.top &&
        y <= targetRect.top + targetRect.height
        
      if (!isInsideSpotlight) {
        onClickOutside()
      }
    }
  }
  
  if (!targetRect) {
    // Show full overlay when target not found
    return (
      <div 
        className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-[2px] animate-in fade-in duration-300"
        onClick={onClickOutside}
      />
    )
  }
  
  return (
    <svg
      ref={overlayRef}
      className="fixed inset-0 z-[90] w-full h-full animate-in fade-in duration-300"
      onClick={handleOverlayClick}
      style={{ pointerEvents: 'auto' }}
    >
      <defs>
        <mask id="spotlight-mask">
          {/* White = visible, black = hidden */}
          <rect x="0" y="0" width="100%" height="100%" fill="white" />
          <rect
            x={targetRect.left}
            y={targetRect.top}
            width={targetRect.width}
            height={targetRect.height}
            rx="8"
            fill="black"
          />
        </mask>
      </defs>
      
      {/* Dark overlay with spotlight cutout */}
      <rect
        x="0"
        y="0"
        width="100%"
        height="100%"
        fill="rgba(0, 0, 0, 0.6)"
        mask="url(#spotlight-mask)"
        style={{ backdropFilter: 'blur(2px)' }}
      />
      
      {/* Spotlight border/glow effect */}
      <rect
        x={targetRect.left}
        y={targetRect.top}
        width={targetRect.width}
        height={targetRect.height}
        rx="8"
        fill="none"
        stroke="rgba(255, 255, 255, 0.3)"
        strokeWidth="2"
        className="animate-pulse"
        style={{ pointerEvents: 'none' }}
      />
    </svg>
  )
}

