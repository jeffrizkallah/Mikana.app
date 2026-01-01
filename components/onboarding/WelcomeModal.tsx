'use client'

import { useSession } from 'next-auth/react'
import { useOnboarding } from '@/lib/onboarding/context'
import { roleWelcomeContent } from '@/lib/onboarding/types'
import { roleDisplayNames, type UserRole } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { X, Sparkles, ArrowRight, SkipForward } from 'lucide-react'

export function WelcomeModal() {
  const { data: session } = useSession()
  const { isWelcomeModalOpen, hideWelcomeModal, startTour, onboardingState } = useOnboarding()
  
  const user = session?.user
  const role = user?.role as UserRole | null
  
  if (!isWelcomeModalOpen || !user || !role) return null
  
  const content = roleWelcomeContent[role]
  const firstName = user.firstName || 'there'
  const roleName = roleDisplayNames[role] || role
  
  const handleStartTour = () => {
    startTour()
  }
  
  const handleSkip = async () => {
    hideWelcomeModal()
    // Mark onboarding as completed but skipped
    try {
      await fetch('/api/users/onboarding', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          onboardingCompleted: true,
          onboardingSkipped: true
        })
      })
    } catch (error) {
      console.error('Error marking onboarding as skipped:', error)
    }
  }
  
  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-title"
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={handleSkip}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl animate-in zoom-in-95 fade-in duration-300 overflow-hidden">
        {/* Decorative top gradient */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-blue-500 to-purple-500" />
        
        {/* Close button */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
        
        {/* Content */}
        <div className="p-8 pt-10">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
                <span className="text-5xl animate-pulse">👋</span>
              </div>
              <div className="absolute -top-1 -right-1">
                <Sparkles className="h-6 w-6 text-amber-400 animate-pulse" />
              </div>
            </div>
          </div>
          
          {/* Greeting */}
          <h2 id="welcome-title" className="text-2xl font-bold text-center mb-2">
            Welcome to Mikana, {firstName}!
          </h2>
          
          <p className="text-center text-muted-foreground mb-6">
            As a <span className="font-semibold text-primary">{roleName}</span>, {content.greeting.toLowerCase()}.
          </p>
          
          {/* Highlights */}
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-800/50 rounded-xl p-5 mb-6">
            <p className="text-sm font-medium text-muted-foreground mb-3">Here&apos;s what you can do:</p>
            <ul className="space-y-3">
              {content.highlights.map((highlight, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">
                    {index + 1}
                  </span>
                  <span className="text-sm text-foreground leading-relaxed">{highlight}</span>
                </li>
              ))}
            </ul>
          </div>
          
          {/* CTA */}
          <p className="text-center text-sm text-muted-foreground mb-6">
            We&apos;ll show you quick tips as you explore. Ready?
          </p>
          
          {/* Buttons */}
          <div className="flex flex-col gap-3">
            <Button 
              onClick={handleStartTour}
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-lg shadow-primary/25"
            >
              {content.ctaText}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            
            <Button 
              variant="ghost" 
              onClick={handleSkip}
              className="w-full text-muted-foreground hover:text-foreground"
            >
              <SkipForward className="mr-2 h-4 w-4" />
              Skip for now
            </Button>
          </div>
        </div>
        
        {/* Footer note */}
        <div className="px-8 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-border">
          <p className="text-xs text-center text-muted-foreground">
            💡 You can replay the tour anytime from your Profile page
          </p>
        </div>
      </div>
    </div>
  )
}

