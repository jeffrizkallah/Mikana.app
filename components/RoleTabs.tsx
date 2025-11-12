'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { ChevronRight } from 'lucide-react'

interface Role {
  roleId: string
  name: string
}

interface RoleTabsProps {
  roles: Role[]
  branchSlug: string
  defaultRole?: string
}

export function RoleTabs({ roles, branchSlug, defaultRole }: RoleTabsProps) {
  const [activeRole, setActiveRole] = useState(defaultRole || roles[0]?.roleId || '')

  if (roles.length === 0) {
    return <div className="text-muted-foreground">No roles available</div>
  }

  return (
    <Tabs value={activeRole} onValueChange={setActiveRole} className="w-full">
      <TabsList className="w-full justify-start overflow-x-auto flex-wrap h-auto">
        {roles.map(role => (
          <TabsTrigger key={role.roleId} value={role.roleId} className="flex-shrink-0">
            {role.name}
          </TabsTrigger>
        ))}
      </TabsList>

      {roles.map(role => (
        <TabsContent key={role.roleId} value={role.roleId} className="mt-6">
          <div className="rounded-lg border bg-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">{role.name}</h3>
              <Link href={`/branch/${branchSlug}/role/${role.roleId}`}>
                <Button variant="outline" size="sm">
                  View Full Details
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <p className="text-sm text-muted-foreground">
              Click "View Full Details" to see responsibilities, checklists, and daily timeline.
            </p>
          </div>
        </TabsContent>
      ))}
    </Tabs>
  )
}

