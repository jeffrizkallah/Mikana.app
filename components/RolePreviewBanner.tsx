'use client'

import { Eye, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRolePreview } from '@/lib/role-preview'
import { roleDisplayNames } from '@/lib/auth'

export function RolePreviewBanner() {
  const { isPreviewMode, effectiveRole, exitPreviewMode } = useRolePreview()

  // Only show when in preview mode
  if (!isPreviewMode || !effectiveRole) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-amber-500 text-amber-950 py-2 px-4 shadow-md no-print">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-4">
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4" />
          <span className="text-sm font-medium">
            You are previewing as: <strong>{roleDisplayNames[effectiveRole]}</strong>
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={exitPreviewMode}
          className="h-7 px-2 text-xs bg-white/90 hover:bg-white border-amber-600 text-amber-900"
        >
          <X className="h-3 w-3 mr-1" />
          Exit Preview
        </Button>
      </div>
    </div>
  )
}

