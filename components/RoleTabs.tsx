'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Clock, ListChecks, ChevronRight } from 'lucide-react'
import { getRole } from '@/lib/data'

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

      {roles.map(role => {
        const roleData = getRole(role.roleId)
        
        if (!roleData) {
          return (
            <TabsContent key={role.roleId} value={role.roleId} className="mt-6">
              <div className="rounded-lg border bg-card p-6">
                <p className="text-sm text-muted-foreground">Role data not available</p>
              </div>
            </TabsContent>
          )
        }

        return (
          <TabsContent key={role.roleId} value={role.roleId} className="mt-6">
            <div className="rounded-lg border bg-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">{role.name}</h3>
                <Link href={`/branch/${branchSlug}/role/${role.roleId}`}>
                  <Button variant="default" size="sm">
                    View Full Details
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
              
              {/* Role Description */}
              <p className="text-sm text-muted-foreground">{roleData.description}</p>
              
              {/* Quick Preview of Key Responsibilities */}
              <div>
                <h4 className="font-semibold mb-2 text-sm">Key Responsibilities:</h4>
                <ul className="space-y-1 text-sm">
                  {roleData.responsibilities.slice(0, 3).map((resp, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                      <span>{resp}</span>
                    </li>
                  ))}
                  {roleData.responsibilities.length > 3 && (
                    <li className="text-muted-foreground ml-6">
                      +{roleData.responsibilities.length - 3} more...
                    </li>
                  )}
                </ul>
              </div>
              
              {/* Quick Action Buttons */}
              <div className="flex gap-2 pt-2 flex-wrap">
                <Link href={`/branch/${branchSlug}/role/${role.roleId}#timeline`}>
                  <Button variant="outline" size="sm">
                    <Clock className="mr-2 h-4 w-4" />
                    Daily Timeline
                  </Button>
                </Link>
                <Link href={`/branch/${branchSlug}/role/${role.roleId}#checklists`}>
                  <Button variant="outline" size="sm">
                    <ListChecks className="mr-2 h-4 w-4" />
                    Checklists
                  </Button>
                </Link>
              </div>
            </div>
          </TabsContent>
        )
      })}
    </Tabs>
  )
}

