'use client'

import { SessionProvider } from 'next-auth/react'
import { ReactNode } from 'react'
import { RolePreviewProvider } from '@/lib/role-preview'
import { RolePreviewBanner } from '@/components/RolePreviewBanner'
import { OnboardingProvider } from '@/lib/onboarding/context'
import { WelcomeModal, SpotlightTour } from '@/components/onboarding'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <RolePreviewProvider>
        <OnboardingProvider>
          <RolePreviewBanner />
          {children}
          <WelcomeModal />
          <SpotlightTour />
        </OnboardingProvider>
      </RolePreviewProvider>
    </SessionProvider>
  )
}

