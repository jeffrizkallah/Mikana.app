'use client'

import { SessionProvider } from 'next-auth/react'
import { ReactNode } from 'react'
import { RolePreviewProvider } from '@/lib/role-preview'
import { RolePreviewBanner } from '@/components/RolePreviewBanner'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <RolePreviewProvider>
        <RolePreviewBanner />
        {children}
      </RolePreviewProvider>
    </SessionProvider>
  )
}

