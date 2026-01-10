'use client'

import { QualityControlWidget } from '@/components/QualityControlWidget'

interface Role {
  roleId: string
  name: string
}

interface BranchRolesSectionProps {
  roles: Role[]
  branchSlug: string
  branchName: string
}

export function BranchRolesSection({ roles, branchSlug, branchName }: BranchRolesSectionProps) {
  // All roles see the Quality Control Widget on branch pages
  return (
    <QualityControlWidget 
      branchSlug={branchSlug} 
      branchName={branchName} 
    />
  )
}
