'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import type { OnboardingState, PageTour } from './types'
import { getToursForRoleAndPath } from './tour-configs'
import type { UserRole } from '@/lib/auth'

interface OnboardingContextType {
  // State
  isLoading: boolean
  onboardingState: OnboardingState | null
  currentTour: PageTour | null
  currentStepIndex: number
  isWelcomeModalOpen: boolean
  isTourActive: boolean
  
  // Actions
  showWelcomeModal: () => void
  hideWelcomeModal: () => void
  startTour: (tourId?: string) => void
  nextStep: () => void
  prevStep: () => void
  skipTour: () => void
  completeTour: () => void
  resetOnboarding: () => Promise<void>
  markTourSeen: (tourId: string) => Promise<void>
  hasSeenTour: (tourId: string) => boolean
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined)

// Local storage key for fallback
const ONBOARDING_STORAGE_KEY = 'mikana_onboarding'

// Get onboarding state from localStorage
function getLocalOnboardingState(): OnboardingState {
  if (typeof window === 'undefined') {
    return {
      onboardingCompleted: false,
      toursCompleted: [],
      onboardingSkipped: false,
      onboardingStartedAt: null
    }
  }
  
  try {
    const stored = localStorage.getItem(ONBOARDING_STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (e) {
    console.error('Error reading onboarding state from localStorage:', e)
  }
  
  return {
    onboardingCompleted: false,
    toursCompleted: [],
    onboardingSkipped: false,
    onboardingStartedAt: null
  }
}

// Save onboarding state to localStorage
function saveLocalOnboardingState(state: OnboardingState): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(state))
  } catch (e) {
    console.error('Error saving onboarding state to localStorage:', e)
  }
}

interface OnboardingProviderProps {
  children: ReactNode
}

export function OnboardingProvider({ children }: OnboardingProviderProps) {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  
  const [isLoading, setIsLoading] = useState(true)
  const [onboardingState, setOnboardingState] = useState<OnboardingState | null>(null)
  const [currentTour, setCurrentTour] = useState<PageTour | null>(null)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(false)
  const [isTourActive, setIsTourActive] = useState(false)
  
  const user = session?.user
  const role = user?.role as UserRole | null
  
  // Load onboarding state on mount
  useEffect(() => {
    if (status === 'loading') return
    
    const loadOnboardingState = async () => {
      setIsLoading(true)
      
      if (!user) {
        setOnboardingState(null)
        setIsLoading(false)
        return
      }
      
      try {
        // Try to fetch from API first
        const response = await fetch('/api/users/onboarding')
        if (response.ok) {
          const data = await response.json()
          setOnboardingState(data)
          // Sync to localStorage as backup
          saveLocalOnboardingState(data)
        } else {
          // Fall back to localStorage
          const localState = getLocalOnboardingState()
          setOnboardingState(localState)
        }
      } catch (error) {
        // Fall back to localStorage on error
        console.error('Error fetching onboarding state:', error)
        const localState = getLocalOnboardingState()
        setOnboardingState(localState)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadOnboardingState()
  }, [user, status])
  
  // Show welcome modal for first-time users
  useEffect(() => {
    if (isLoading || !onboardingState || !user) return
    
    // Show welcome modal if user hasn't completed or skipped onboarding
    if (!onboardingState.onboardingCompleted && !onboardingState.onboardingSkipped) {
      setIsWelcomeModalOpen(true)
    }
  }, [isLoading, onboardingState, user])
  
  // Check for unseen tours when route changes
  useEffect(() => {
    if (isLoading || !onboardingState || !role || !pathname) return
    if (isTourActive || isWelcomeModalOpen) return
    if (!onboardingState.onboardingCompleted) return // Wait for welcome modal first
    
    // Find tours for current page that haven't been seen
    const availableTours = getToursForRoleAndPath(role, pathname)
    const unseenTour = availableTours.find(tour => 
      !onboardingState.toursCompleted.includes(tour.tourId)
    )
    
    if (unseenTour) {
      // Small delay to let the page render first
      const timer = setTimeout(() => {
        setCurrentTour(unseenTour)
        setCurrentStepIndex(0)
        setIsTourActive(true)
      }, 500)
      
      return () => clearTimeout(timer)
    }
  }, [pathname, isLoading, onboardingState, role, isTourActive, isWelcomeModalOpen])
  
  // Update onboarding state in database and localStorage
  const updateOnboardingState = useCallback(async (updates: Partial<OnboardingState>) => {
    if (!onboardingState) return
    
    const newState = { ...onboardingState, ...updates }
    setOnboardingState(newState)
    saveLocalOnboardingState(newState)
    
    // Try to sync to database
    try {
      await fetch('/api/users/onboarding', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
    } catch (error) {
      console.error('Error syncing onboarding state:', error)
    }
  }, [onboardingState])
  
  // Actions
  const showWelcomeModal = useCallback(() => {
    setIsWelcomeModalOpen(true)
  }, [])
  
  const hideWelcomeModal = useCallback(() => {
    setIsWelcomeModalOpen(false)
  }, [])
  
  const startTour = useCallback((tourId?: string) => {
    setIsWelcomeModalOpen(false)
    
    if (tourId) {
      // Start specific tour
      const tours = role ? getToursForRoleAndPath(role, pathname) : []
      const tour = tours.find(t => t.tourId === tourId)
      if (tour) {
        setCurrentTour(tour)
        setCurrentStepIndex(0)
        setIsTourActive(true)
      }
    } else {
      // Start first available tour for current page
      const tours = role ? getToursForRoleAndPath(role, pathname) : []
      if (tours.length > 0) {
        setCurrentTour(tours[0])
        setCurrentStepIndex(0)
        setIsTourActive(true)
      }
    }
    
    // Mark onboarding as completed (welcome modal done)
    updateOnboardingState({
      onboardingCompleted: true,
      onboardingStartedAt: onboardingState?.onboardingStartedAt || new Date().toISOString()
    })
  }, [role, pathname, updateOnboardingState, onboardingState?.onboardingStartedAt])
  
  const nextStep = useCallback(() => {
    if (!currentTour) return
    
    if (currentStepIndex < currentTour.steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1)
    } else {
      // Tour complete
      completeTour()
    }
  }, [currentTour, currentStepIndex])
  
  const prevStep = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1)
    }
  }, [currentStepIndex])
  
  const skipTour = useCallback(() => {
    if (currentTour) {
      // Mark current tour as seen even if skipped
      markTourSeen(currentTour.tourId)
    }
    setIsTourActive(false)
    setCurrentTour(null)
    setCurrentStepIndex(0)
  }, [currentTour])
  
  const completeTour = useCallback(() => {
    if (currentTour) {
      markTourSeen(currentTour.tourId)
    }
    setIsTourActive(false)
    setCurrentTour(null)
    setCurrentStepIndex(0)
  }, [currentTour])
  
  const markTourSeen = useCallback(async (tourId: string) => {
    if (!onboardingState) return
    
    const newToursCompleted = [...new Set([...onboardingState.toursCompleted, tourId])]
    await updateOnboardingState({ toursCompleted: newToursCompleted })
  }, [onboardingState, updateOnboardingState])
  
  const hasSeenTour = useCallback((tourId: string) => {
    return onboardingState?.toursCompleted.includes(tourId) || false
  }, [onboardingState])
  
  const resetOnboarding = useCallback(async () => {
    const freshState: OnboardingState = {
      onboardingCompleted: false,
      toursCompleted: [],
      onboardingSkipped: false,
      onboardingStartedAt: null
    }
    
    setOnboardingState(freshState)
    saveLocalOnboardingState(freshState)
    setIsTourActive(false)
    setCurrentTour(null)
    setCurrentStepIndex(0)
    
    // Sync to database
    try {
      await fetch('/api/users/onboarding', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(freshState)
      })
    } catch (error) {
      console.error('Error resetting onboarding:', error)
    }
    
    // Show welcome modal again
    setIsWelcomeModalOpen(true)
  }, [])
  
  const value: OnboardingContextType = {
    isLoading,
    onboardingState,
    currentTour,
    currentStepIndex,
    isWelcomeModalOpen,
    isTourActive,
    showWelcomeModal,
    hideWelcomeModal,
    startTour,
    nextStep,
    prevStep,
    skipTour,
    completeTour,
    resetOnboarding,
    markTourSeen,
    hasSeenTour
  }
  
  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  )
}

export function useOnboarding() {
  const context = useContext(OnboardingContext)
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider')
  }
  return context
}

