'use client'

import { useEffect } from 'react'
import { useOnboarding } from '@/lib/onboarding/context'
import { SpotlightOverlay } from './SpotlightOverlay'
import { SpotlightTooltip } from './SpotlightTooltip'

export function SpotlightTour() {
  const {
    currentTour,
    currentStepIndex,
    isTourActive,
    nextStep,
    prevStep,
    skipTour
  } = useOnboarding()
  
  // Handle keyboard navigation
  useEffect(() => {
    if (!isTourActive) return
    
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          skipTour()
          break
        case 'ArrowRight':
        case 'Enter':
          nextStep()
          break
        case 'ArrowLeft':
          prevStep()
          break
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isTourActive, nextStep, prevStep, skipTour])
  
  // Prevent body scroll when tour is active
  useEffect(() => {
    if (isTourActive) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    
    return () => {
      document.body.style.overflow = ''
    }
  }, [isTourActive])
  
  if (!isTourActive || !currentTour) return null
  
  const currentStep = currentTour.steps[currentStepIndex]
  
  if (!currentStep) return null
  
  return (
    <div className="spotlight-tour" role="dialog" aria-modal="true">
      <SpotlightOverlay
        targetSelector={currentStep.targetSelector}
        padding={currentStep.highlightPadding || 8}
        onClickOutside={skipTour}
      />
      
      <SpotlightTooltip
        step={currentStep}
        stepIndex={currentStepIndex}
        totalSteps={currentTour.steps.length}
        onNext={nextStep}
        onPrev={prevStep}
        onSkip={skipTour}
      />
    </div>
  )
}

