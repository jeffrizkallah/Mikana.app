'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useSession } from 'next-auth/react'
import type { UserRole } from '@/lib/auth'

interface RolePreviewState {
  isPreviewMode: boolean
  previewRole: UserRole | null
  actualRole: UserRole | null
  effectiveRole: UserRole | null // The role being used (preview or actual)
}

interface RolePreviewContextType extends RolePreviewState {
  setPreviewRole: (role: UserRole | null) => void
  exitPreviewMode: () => void
  canPreview: boolean // Only admins can preview
}

const RolePreviewContext = createContext<RolePreviewContextType | null>(null)

const STORAGE_KEY = 'mikana-role-preview'

export function RolePreviewProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession()
  const actualRole = (session?.user?.role as UserRole) || null
  
  const [previewRole, setPreviewRoleState] = useState<UserRole | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  // Only admins can preview other roles
  const canPreview = actualRole === 'admin'

  // Load preview state from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored && canPreview) {
        try {
          const parsed = JSON.parse(stored)
          if (parsed.previewRole) {
            setPreviewRoleState(parsed.previewRole)
          }
        } catch (e) {
          localStorage.removeItem(STORAGE_KEY)
        }
      }
      setIsInitialized(true)
    }
  }, [canPreview])

  // Clear preview if user loses admin status
  useEffect(() => {
    if (!canPreview && previewRole) {
      setPreviewRoleState(null)
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [canPreview, previewRole])

  // Set preview role and persist
  const setPreviewRole = (role: UserRole | null) => {
    if (!canPreview) return
    
    setPreviewRoleState(role)
    
    if (role) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ previewRole: role }))
      // Also set a cookie for server-side access
      document.cookie = `role-preview=${role}; path=/; max-age=86400; SameSite=Lax`
    } else {
      localStorage.removeItem(STORAGE_KEY)
      document.cookie = 'role-preview=; path=/; max-age=0'
    }
  }

  const exitPreviewMode = () => {
    setPreviewRole(null)
  }

  const isPreviewMode = canPreview && previewRole !== null && previewRole !== actualRole
  const effectiveRole = isPreviewMode ? previewRole : actualRole

  const value: RolePreviewContextType = {
    isPreviewMode,
    previewRole,
    actualRole,
    effectiveRole,
    setPreviewRole,
    exitPreviewMode,
    canPreview,
  }

  // Don't render children until we've loaded from localStorage
  if (!isInitialized) {
    return null
  }

  return (
    <RolePreviewContext.Provider value={value}>
      {children}
    </RolePreviewContext.Provider>
  )
}

export function useRolePreview() {
  const context = useContext(RolePreviewContext)
  if (!context) {
    throw new Error('useRolePreview must be used within a RolePreviewProvider')
  }
  return context
}

// Helper hook to get the effective role (for components that need to check permissions)
export function useEffectiveRole(): UserRole | null {
  const { effectiveRole } = useRolePreview()
  return effectiveRole
}

