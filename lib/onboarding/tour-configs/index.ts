import type { PageTour } from '../types'
import { adminTours } from './admin'
import { operationsLeadTours } from './operations-lead'
import { dispatcherTours } from './dispatcher'
import { centralKitchenTours } from './central-kitchen'
import { branchManagerTours } from './branch-manager'
import { branchStaffTours } from './branch-staff'
import { sharedTours } from './shared'

// All tour configurations combined
export const allTours: PageTour[] = [
  ...adminTours,
  ...operationsLeadTours,
  ...dispatcherTours,
  ...centralKitchenTours,
  ...branchManagerTours,
  ...branchStaffTours,
  ...sharedTours,
]

// Get tours for a specific role and path
export function getToursForRoleAndPath(role: string, path: string): PageTour[] {
  return allTours
    .filter(tour => {
      // Check if role matches
      if (!tour.roles.includes(role as any)) return false
      
      // Check if path matches the pattern
      return matchPath(path, tour.pathPattern)
    })
    .sort((a, b) => (a.priority || 99) - (b.priority || 99))
}

// Simple path matching with wildcards
function matchPath(path: string, pattern: string): boolean {
  // Exact match
  if (path === pattern) return true
  
  // Wildcard pattern (e.g., '/branch/*')
  if (pattern.endsWith('/*')) {
    const prefix = pattern.slice(0, -2)
    return path.startsWith(prefix)
  }
  
  // Pattern with parameter (e.g., '/branch/[slug]')
  if (pattern.includes('[')) {
    const regexPattern = pattern
      .replace(/\[.*?\]/g, '[^/]+')
      .replace(/\//g, '\\/')
    const regex = new RegExp(`^${regexPattern}$`)
    return regex.test(path)
  }
  
  return false
}

// Export individual tour configs for direct access
export { adminTours } from './admin'
export { operationsLeadTours } from './operations-lead'
export { dispatcherTours } from './dispatcher'
export { centralKitchenTours } from './central-kitchen'
export { branchManagerTours } from './branch-manager'
export { branchStaffTours } from './branch-staff'
export { sharedTours } from './shared'

