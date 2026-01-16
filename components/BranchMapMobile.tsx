'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { MapPin, User, Phone, ChevronRight, ChefHat } from 'lucide-react'
import type { Branch } from '@/lib/data'

interface BranchMapMobileProps {
  branches: Branch[]
}

export function BranchMapMobile({ branches }: BranchMapMobileProps) {
  // Group branches by location
  const branchesByLocation = useMemo(() => {
    const grouped: Record<string, Branch[]> = {}
    
    branches.forEach(branch => {
      const location = branch.location
      if (!grouped[location]) {
        grouped[location] = []
      }
      grouped[location].push(branch)
    })
    
    // Sort locations alphabetically
    return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b))
  }, [branches])
  
  const totalManagers = useMemo(() => {
    const managers = new Set(branches.map(b => b.manager))
    return managers.size
  }, [branches])
  
  return (
    <div className="space-y-4">
      {/* Quick Stats */}
      <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground pb-2 border-b">
        <span><strong className="text-foreground">{branches.length}</strong> Branches</span>
        <span>•</span>
        <span><strong className="text-foreground">{branchesByLocation.length}</strong> Emirates</span>
        <span>•</span>
        <span><strong className="text-foreground">{totalManagers}</strong> Managers</span>
      </div>
      
      {/* Branches by Location */}
      <div className="space-y-3">
        {branchesByLocation.map(([location, locationBranches]) => (
          <div key={location} className="space-y-2">
            {/* Location Header */}
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{location}</span>
              <span className="text-xs bg-muted px-1.5 py-0.5 rounded-full">
                {locationBranches.length}
              </span>
            </div>
            
            {/* Branch Cards */}
            <div className="space-y-1.5 pl-6">
              {locationBranches.map(branch => {
                const isProduction = branch.branchType === 'production' || branch.slug === 'central-kitchen'
                const primaryContact = branch.contacts?.[0]
                
                return (
                  <Link
                    key={branch.slug}
                    href={`/branch/${branch.slug}`}
                    className="block"
                  >
                    <div className="flex items-center justify-between p-2.5 bg-muted/40 hover:bg-muted/70 rounded-lg transition-colors group">
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        {/* Icon */}
                        <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                          isProduction ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'
                        }`}>
                          {isProduction ? (
                            <ChefHat className="h-4 w-4" />
                          ) : (
                            <MapPin className="h-4 w-4" />
                          )}
                        </div>
                        
                        {/* Branch Info */}
                        <div className="min-w-0 flex-1">
                          <h4 className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                            {branch.name}
                          </h4>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1 truncate">
                              <User className="h-3 w-3 shrink-0" />
                              <span className="truncate">{branch.manager}</span>
                            </span>
                            {primaryContact?.phone && (
                              <span className="flex items-center gap-1 shrink-0">
                                <Phone className="h-3 w-3" />
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Arrow */}
                      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 group-hover:text-primary transition-colors" />
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </div>
      
      {/* Legend */}
      <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground pt-2 border-t">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-purple-600"></div>
          <span>Central Kitchen</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div>
          <span>Branch</span>
        </div>
      </div>
    </div>
  )
}
